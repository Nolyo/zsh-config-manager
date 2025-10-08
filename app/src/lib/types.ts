// Type definitions for the application

export interface Alias {
  name: string;
  command: string;
  shared: boolean; // true = shared (versioned), false = local
}

export interface ShellFunction {
  name: string;
  content: string;
  shared: boolean;
}

export interface ConfigContent {
  content: string;
  shared: boolean;
}

export interface Config {
  paths: string[];
  envVars: Record<string, string>;
  ohmyzsh: {
    theme: string;
    plugins: string[];
  };
  historySize: number;
}

export interface GitStatus {
  branch: string;
  clean: boolean;
  ahead: number;
  behind: number;
  modified: string[];
  untracked: string[];
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface ExportData {
  aliases: Alias[];
  functions: ShellFunction[];
  config: Config;
  version: string;
}

export type MergeStrategy = 'overwrite' | 'keep' | 'ask';
