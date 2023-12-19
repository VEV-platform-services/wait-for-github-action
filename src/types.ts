export interface BaseOptions {
  repo: string;
  github_token: string;
  debug: boolean;
  max_wait: number;
}

export interface TriggerOptions extends BaseOptions {
  workflow_name: string;
  branch: string;
  input: {
    [key: string]: string;
  };
}

export interface WaitForOptions extends BaseOptions {
  branch: string;
  workflow_name: string[];
  createdAfterTime?: Date;
  ref: string;
}

export type WorkflowSummary = {
  succeeded: number;
  failed: number;
  pending: number;
};
