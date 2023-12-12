import { Option, program } from "commander";
import { triggerWorkflowHandler } from "./trigger";
import { waitForWorkflowHandler } from "./wait";

function parseInputs(value: string, previous: { key: string; val: string }[]) {
  if (!value) {
    return previous;
  }
  const [key, val] = value.split("=");
  if (!key || !val) {
    throw new Error("Invalid key-value pair format. Expected format is key=value");
  }
  previous.push({ key, val });
  return previous;
}

program
  .name("wait-for-github-workflow")
  .command("trigger")
  .addHelpText(
    "after",
    `
  Trigger a workflow and wait for it to finish. If the workflow fails, this command will fail.

  Example:
  export GITHUB_TOKEN=...
  wait-for-github-workflow trigger -r VEV-platform-services/vev-service -w "Lint" -b abcdef
  `,
  )
  .addOption(
    new Option("-r, --repo <repo>", "The repository name in the format 'organisation/repo'").default(process.env.GITHUB_REPOSITORY).makeOptionMandatory(true),
  )
  .addOption(new Option("-w, --workflow_name <workflow_name>", "The workflow name").default(process.env.WORKFLOW_NAME).makeOptionMandatory(true))
  .addOption(new Option("-b, --branch <branch>", "The branch the workflow will triggered on").default(process.env.GITHUB_BRANCH).makeOptionMandatory(true))
  .addOption(new Option("-t, --github_token <github_token>", "The github token").default(process.env.GITHUB_TOKEN).makeOptionMandatory(true))
  .addOption(new Option("-m, --max_wait <max_wait>", "The max wait time in minutes").default(process.env.MAX_WAIT ?? 60).makeOptionMandatory(true))
  .addOption(new Option("-i, --inputs <items...>", "The workflow inputs").default([]).argParser(parseInputs))
  .action(triggerWorkflowHandler);

program
  .name("wait-for-github-workflow")
  .command("wait")
  .addHelpText(
    "after",
    `
  Wait for a workflow to finish. If the workflow fails, this command will fail.

  Example:
  export GITHUB_TOKEN=...
  wait-for-github-workflow wait -r VEV-platform-services/vev-service -w "Pull request" "Lint"  -b abcdef
  `,
  )
  .addOption(
    new Option("-r, --repo <repo>", "The repository name in the format 'organisation/repo'").default(process.env.GITHUB_REPOSITORY).makeOptionMandatory(true),
  )
  .addOption(new Option("-w, --workflow_name <items...>", "The workflow name").default(process.env.WORKFLOW_NAME).makeOptionMandatory(true))
  .addOption(new Option("-b, --ref <ref>", "The commit sha the workflow was triggered on").default(process.env.GITHUB_SHA).makeOptionMandatory(true))
  .addOption(new Option("-t, --github_token <github_token>", "The github token").default(process.env.GITHUB_TOKEN).makeOptionMandatory(true))
  .addOption(new Option("-m, --max_wait <max_wait>", "The max wait time in minutes").default(process.env.MAX_WAIT ?? 60).makeOptionMandatory(true))
  .action(waitForWorkflowHandler);

program.parse();

process.on("SIGINT", () => {
  console.log("Caught interrupt signal");
  process.exit(1);
});
