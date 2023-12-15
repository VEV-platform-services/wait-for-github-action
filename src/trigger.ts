import { Octokit } from "@octokit/rest";
import { TriggerOptions } from "./types";
import { waitForWorkflowHandler } from "./wait";

export async function triggerWorkflowHandler(opts: TriggerOptions) {
  const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000); // Give some leeway incase the time between running this command and github actions NTP is out of sync
  const octokit = new Octokit({
    auth: opts.github_token,
  });
  const owner = opts.repo.split("/")[0];
  const repo = opts.repo.split("/")[1];
  const repos = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
  });
  const foundWorkflow = repos.data.workflows.find((workflow) => {
    return workflow.name === opts.workflow_name;
  });
  if (!foundWorkflow) {
    throw new Error(`Workflow ${opts.workflow_name} not found`);
  }

  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: foundWorkflow.id,
    ref: opts.branch,
    inputs: opts.input,
  });

  const found = await octokit.repos.listCommits({
    owner,
    repo,
    sha: opts.branch,
    per_page: 1,
  });

  await waitForWorkflowHandler({
    ...opts,
    ref: found.data[0].sha,
    branch: opts.branch,
    workflow_name: [opts.workflow_name],
    createdAfterTime: fifteenSecondsAgo,
  });
}
