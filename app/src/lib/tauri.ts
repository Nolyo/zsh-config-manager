// Tauri command wrappers
// These will call the Rust backend commands

import { invoke } from "@tauri-apps/api/core";
import type { Alias, ShellFunction, GitStatus, GitCommit, MergeStrategy, ConfigContent } from "./types";

// Alias commands
export async function listAliases(shared: boolean): Promise<Alias[]> {
  return invoke("list_aliases", { shared });
}

export async function addAlias(name: string, command: string, shared: boolean): Promise<void> {
  return invoke("add_alias", { name, command, shared });
}

export async function updateAlias(oldName: string, newName: string, command: string, shared: boolean): Promise<void> {
  return invoke("update_alias", { oldName, newName, command, shared });
}

export async function deleteAlias(name: string, shared: boolean): Promise<void> {
  return invoke("delete_alias", { name, shared });
}

export async function listSecretsAliases(): Promise<Alias[]> {
  return invoke("list_secrets_aliases");
}

// Function commands
export async function listFunctions(shared: boolean): Promise<ShellFunction[]> {
  return invoke("list_functions", { shared });
}

export async function addFunction(name: string, content: string, shared: boolean): Promise<void> {
  return invoke("add_function", { name, content, shared });
}

export async function updateFunction(name: string, content: string, shared: boolean): Promise<void> {
  return invoke("update_function", { name, content, shared });
}

export async function deleteFunction(name: string, shared: boolean): Promise<void> {
  return invoke("delete_function", { name, shared });
}

// Config commands
export async function getConfig(shared: boolean): Promise<ConfigContent> {
  return invoke("get_config", { shared });
}

export async function updateConfig(content: string, shared: boolean): Promise<void> {
  return invoke("update_config", { content, shared });
}

export async function reloadZsh(): Promise<string> {
  return invoke("reload_zsh");
}

// Export/Import commands
export async function exportConfig(path: string): Promise<string> {
  return invoke("export_config", { path });
}

export async function importConfig(path: string, mergeStrategy: MergeStrategy): Promise<void> {
  return invoke("import_config", { path, mergeStrategy });
}

// Git commands
export async function gitStatus(): Promise<GitStatus> {
  return invoke("git_status");
}

export async function gitPull(): Promise<string> {
  return invoke("git_pull");
}

export async function gitPush(): Promise<string> {
  return invoke("git_push");
}

export async function gitCommit(message: string): Promise<string> {
  return invoke("git_commit", { message });
}

export async function gitLog(limit: number): Promise<GitCommit[]> {
  return invoke("git_log", { limit });
}

export async function gitDiff(): Promise<string> {
  return invoke("git_diff");
}

export async function gitInit(): Promise<string> {
  return invoke("git_init");
}
