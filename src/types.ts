export type TriggerOptions = {
  owner: string;
  repo: string;
  workflow_name: string;
  ref: string;
  github_token: string;
  max_wait: number;
  input: {
    [key: string]: string;
  };
};

export type WaitForOptions = {
  workflow_name: string[];
  createdAfterTime?: Date;
} & Pick<TriggerOptions, "owner" | "repo" | "ref" | "github_token" | "max_wait">;

export type WorkflowSummary = {
  succeeded: number;
  failed: number;
  pending: number;
};