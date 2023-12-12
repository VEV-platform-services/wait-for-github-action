export type TriggerOptions = {
  repo: string;
  workflow_name: string;
  branch: string;
  github_token: string;
  max_wait: number;
  input: {
    [key: string]: string;
  };
};

export type WaitForOptions = {
  workflow_name: string[];
  createdAfterTime?: Date;
  ref: string;
} & Pick<TriggerOptions, "repo" | "github_token" | "max_wait">;

export type WorkflowSummary = {
  succeeded: number;
  failed: number;
  pending: number;
};
