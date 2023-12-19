import { Octokit } from "@octokit/rest";
import retry from "async-retry";
import { WaitForOptions, WorkflowSummary } from "./types";

const retryOptions: retry.Options = {
  minTimeout: 10 * 1000,
  maxTimeout: 10 * 1000,
  onRetry(e, attempt) {
    console.log(`Attempt ${attempt}: ${e.message}`);
  },
};

export async function waitForWorkflowHandler(opts: WaitForOptions) {
  console.log("Repository :", opts.repo);
  console.log("Workflow Name:", opts.workflow_name);
  console.log("Github SHA: ", opts.ref);
  await waitForWorkflow(opts);
}

export async function waitForWorkflow(opts: WaitForOptions) {
  const octokit = new Octokit({
    auth: opts.github_token,
  });
  const checkWorkflowStatusOrError = async () => {
    const { failed, pending, succeeded } = await checkWorkflowStatus(opts, octokit);
    if (pending > 0) {
      throw new Error(`Waiting for ${pending} workflows to finish`);
    }
    return { failed, pending, succeeded };
  };

  const { failed, succeeded } = await retry(checkWorkflowStatusOrError, {
    ...retryOptions,
    retries: opts.max_wait * 6,
  });
  if (failed > 0) {
    throw new Error(`${failed} workflows failed`);
  }
  console.log(`${succeeded} workflows succeeded`);
}

async function checkWorkflowStatus(opts: WaitForOptions, octokit: Octokit): Promise<WorkflowSummary> {
  const workflowIds = await getWorkflowIdsForWorkflowName(octokit, opts);

  const allWorkflowRuns = await getAllWorkflowRuns(octokit, opts, workflowIds);

  if (allWorkflowRuns.length === 0) {
    throw new Error("No workflow runs found");
  }
  return {
    failed: allWorkflowRuns.filter((workflowRuns) => workflowRuns.conclusion === "failure").length,
    pending: allWorkflowRuns.filter((workflowRuns) => workflowRuns.conclusion === null).length,
    succeeded: allWorkflowRuns.filter((workflowRuns) => workflowRuns.conclusion === "success").length,
  };
}

async function getAllWorkflowRuns(octokit: Octokit, opts: WaitForOptions, workflowIds: number[]) {
  const fetchWorkflowJobPromises = workflowIds.map(async (workflow_id: number) => {
    const owner = opts.repo.split("/")[0];
    const repo = opts.repo.split("/")[1];
    const workflowRuns = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id,
      head_sha: opts.ref,
    });

    return workflowRuns.data.workflow_runs.filter(
      (workflowRun) => !opts.createdAfterTime || workflowRun.created_at > opts.createdAfterTime?.toISOString(),
    )?.[0];
  });

  const allWorkflowRuns = await Promise.all(fetchWorkflowJobPromises);
  return allWorkflowRuns.filter((workflowRun) => workflowRun);
}

async function getWorkflowIdsForWorkflowName(octokit: Octokit, opts: WaitForOptions): Promise<number[]> {
  const owner = opts.repo.split("/")[0];
  const repo = opts.repo.split("/")[1];
  const repoWorkflows = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
  });
  return repoWorkflows.data.workflows.filter((workflow) => opts.workflow_name.includes(workflow.name)).map((workflow) => workflow.id);
}
