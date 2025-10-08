use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Alias {
    pub name: String,
    pub command: String,
    pub shared: bool,
}

fn get_home_dir() -> PathBuf {
    dirs::home_dir().expect("Could not find home directory")
}

fn get_alias_file_path(shared: bool) -> PathBuf {
    let home = get_home_dir();
    if shared {
        home.join(".zsh/aliases.zsh")
    } else {
        home.join(".zsh/aliases.local.zsh")
    }
}

fn get_secrets_file_path() -> PathBuf {
    let home = get_home_dir();
    home.join(".zshrc.secrets")
}

fn parse_alias_line(line: &str) -> Option<Alias> {
    let line = line.trim();

    // Skip comments and empty lines
    if line.starts_with('#') || line.is_empty() {
        return None;
    }

    // Parse alias lines: alias name="command"
    if line.starts_with("alias ") {
        let content = line.strip_prefix("alias ")?.trim();

        if let Some(eq_pos) = content.find('=') {
            let name = content[..eq_pos].trim().to_string();
            let command = content[eq_pos + 1..]
                .trim()
                .trim_matches('"')
                .trim_matches('\'')
                .to_string();

            return Some(Alias {
                name,
                command,
                shared: false, // Will be set by caller
            });
        }
    }

    None
}

#[tauri::command]
pub fn list_aliases(shared: bool) -> Result<Vec<Alias>, String> {
    let file_path = get_alias_file_path(shared);

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read alias file: {}", e))?;

    let aliases: Vec<Alias> = content
        .lines()
        .filter_map(parse_alias_line)
        .map(|mut alias| {
            alias.shared = shared;
            alias
        })
        .collect();

    Ok(aliases)
}

#[tauri::command]
pub fn add_alias(name: String, command: String, shared: bool) -> Result<(), String> {
    let file_path = get_alias_file_path(shared);

    // Check if alias already exists
    let existing_aliases = list_aliases(shared)?;
    if existing_aliases.iter().any(|a| a.name == name) {
        return Err(format!("Alias '{}' already exists", name));
    }

    // Read existing content
    let mut content = if file_path.exists() {
        fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read file: {}", e))?
    } else {
        String::new()
    };

    // Add new alias
    if !content.ends_with('\n') && !content.is_empty() {
        content.push('\n');
    }
    content.push_str(&format!("alias {}=\"{}\"\n", name, command));

    // Write back
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn update_alias(old_name: String, new_name: String, command: String, shared: bool) -> Result<(), String> {
    let file_path = get_alias_file_path(shared);

    if !file_path.exists() {
        return Err("Alias file not found".to_string());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let mut found = false;
    let new_content: Vec<String> = content
        .lines()
        .map(|line| {
            if let Some(alias) = parse_alias_line(line) {
                if alias.name == old_name {
                    found = true;
                    return format!("alias {}=\"{}\"", new_name, command);
                }
            }
            line.to_string()
        })
        .collect();

    if !found {
        return Err(format!("Alias '{}' not found", old_name));
    }

    fs::write(&file_path, new_content.join("\n") + "\n")
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn delete_alias(name: String, shared: bool) -> Result<(), String> {
    let file_path = get_alias_file_path(shared);

    if !file_path.exists() {
        return Err("Alias file not found".to_string());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let mut found = false;
    let new_content: Vec<String> = content
        .lines()
        .filter(|line| {
            if let Some(alias) = parse_alias_line(line) {
                if alias.name == name {
                    found = true;
                    return false;
                }
            }
            true
        })
        .map(|s| s.to_string())
        .collect();

    if !found {
        return Err(format!("Alias '{}' not found", name));
    }

    fs::write(&file_path, new_content.join("\n") + "\n")
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn list_secrets_aliases() -> Result<Vec<Alias>, String> {
    let file_path = get_secrets_file_path();

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read secrets file: {}", e))?;

    let aliases: Vec<Alias> = content
        .lines()
        .filter_map(parse_alias_line)
        .map(|mut alias| {
            alias.shared = false; // Secrets are always local
            alias
        })
        .collect();

    Ok(aliases)
}
