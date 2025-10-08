use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitStatus {
    pub branch: String,
    pub clean: bool,
    pub ahead: u32,
    pub behind: u32,
    pub modified: Vec<String>,
    pub untracked: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitCommit {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

fn get_zsh_config_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".zsh")
}

fn run_git_command(args: &[&str]) -> Result<String, String> {
    let config_dir = get_zsh_config_dir();

    let output = Command::new("git")
        .args(args)
        .current_dir(&config_dir)
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git command failed: {}", stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub fn git_status() -> Result<GitStatus, String> {
    // Get current branch
    let branch_output = run_git_command(&["rev-parse", "--abbrev-ref", "HEAD"])?;
    let branch = branch_output.trim().to_string();

    // Get modified files
    let status_output = run_git_command(&["status", "--porcelain"])?;
    let mut modified = Vec::new();
    let mut untracked = Vec::new();

    for line in status_output.lines() {
        if line.is_empty() {
            continue;
        }

        let status_code = &line[..2];
        let file = line[3..].trim().to_string();

        if status_code.starts_with("??") {
            untracked.push(file);
        } else if !status_code.trim().is_empty() {
            modified.push(file);
        }
    }

    let clean = modified.is_empty() && untracked.is_empty();

    // Get ahead/behind status
    let mut ahead = 0;
    let mut behind = 0;

    if let Ok(upstream_output) = run_git_command(&["rev-parse", "--abbrev-ref", "@{upstream}"]) {
        let upstream = upstream_output.trim();

        if let Ok(ahead_output) = run_git_command(&["rev-list", "--count", &format!("{}..HEAD", upstream)]) {
            ahead = ahead_output.trim().parse().unwrap_or(0);
        }

        if let Ok(behind_output) = run_git_command(&["rev-list", "--count", &format!("HEAD..{}", upstream)]) {
            behind = behind_output.trim().parse().unwrap_or(0);
        }
    }

    Ok(GitStatus {
        branch,
        clean,
        ahead,
        behind,
        modified,
        untracked,
    })
}

#[tauri::command]
pub fn git_pull() -> Result<String, String> {
    let output = run_git_command(&["pull", "--rebase"])?;
    Ok(output.trim().to_string())
}

#[tauri::command]
pub fn git_push() -> Result<String, String> {
    let output = run_git_command(&["push"])?;
    Ok(output.trim().to_string())
}

#[tauri::command]
pub fn git_commit(message: String) -> Result<String, String> {
    // Stage all changes
    run_git_command(&["add", "-A"])?;

    // Commit
    let output = run_git_command(&["commit", "-m", &message])?;
    Ok(output.trim().to_string())
}

#[tauri::command]
pub fn git_log(limit: usize) -> Result<Vec<GitCommit>, String> {
    let format = "%H%n%s%n%an%n%ai%n---";
    let output = run_git_command(&["log", &format!("-{}", limit), &format!("--format={}", format)])?;

    let commits: Vec<GitCommit> = output
        .split("---\n")
        .filter(|s| !s.trim().is_empty())
        .filter_map(|commit_str| {
            let lines: Vec<&str> = commit_str.lines().collect();
            if lines.len() >= 4 {
                Some(GitCommit {
                    hash: lines[0].to_string(),
                    message: lines[1].to_string(),
                    author: lines[2].to_string(),
                    date: lines[3].to_string(),
                })
            } else {
                None
            }
        })
        .collect();

    Ok(commits)
}

#[tauri::command]
pub fn git_diff() -> Result<String, String> {
    let output = run_git_command(&["diff"])?;
    Ok(output)
}

#[tauri::command]
pub fn git_init() -> Result<String, String> {
    let config_dir = get_zsh_config_dir();

    let output = Command::new("git")
        .args(&["init"])
        .current_dir(&config_dir)
        .output()
        .map_err(|e| format!("Failed to initialize git repository: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git init failed: {}", stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
