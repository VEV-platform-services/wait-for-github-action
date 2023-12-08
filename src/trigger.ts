import { Octokit } from "@octokit/rest";
import { TriggerOptions } from "./types";
import { waitForWorkflowHandler } from "./wait";

export async function triggerWorkflowHandler(opts: TriggerOptions) {
  const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000); // Give some leeway incase the time between running this command and github actions NTP is out of sync
  const octokit = new Octokit({
    auth: opts.github_token,
  });
  const repos = await octokit.actions.listRepoWorkflows({
    owner: opts.owner,
    repo: opts.repo,
  });
  const foundWorkflow = repos.data.workflows.find((workflow) => {
    return workflow.name === opts.workflow_name;
  });
  if (!foundWorkflow) {
    throw new Error(`Workflow ${opts.workflow_name} not found`);
  }

  await octokit.rest.actions.createWorkflowDispatch({
    owner: opts.owner,
    repo: opts.repo,
    workflow_id: foundWorkflow.id,
    ref: opts.ref,
    inputs: opts.input,
  });

  const found = await octokit.repos.listCommits({
    owner: opts.owner,
    repo: opts.repo,
    sha: opts.ref,
    per_page: 1,
  });

  await waitForWorkflowHandler({
    ...opts,
    ref: found.data[0].sha,
    workflow_name: [opts.workflow_name],
    createdAfterTime: fifteenSecondsAgo,
  });
}
