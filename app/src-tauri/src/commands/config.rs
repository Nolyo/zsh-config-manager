use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigContent {
    pub content: String,
    pub shared: bool,
}

fn get_home_dir() -> PathBuf {
    dirs::home_dir().expect("Could not find home directory")
}

fn get_config_file_path(shared: bool) -> PathBuf {
    let home = get_home_dir();
    if shared {
        home.join(".zsh/config.zsh")
    } else {
        home.join(".zsh/config.local.zsh")
    }
}

#[tauri::command]
pub fn get_config(shared: bool) -> Result<ConfigContent, String> {
    let file_path = get_config_file_path(shared);

    let content = if file_path.exists() {
        fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?
    } else {
        String::new()
    };

    Ok(ConfigContent { content, shared })
}

#[tauri::command]
pub fn update_config(content: String, shared: bool) -> Result<(), String> {
    let file_path = get_config_file_path(shared);

    // Create parent directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn reload_zsh() -> Result<String, String> {
    // Return a message suggesting how to reload ZSH
    // We can't actually reload the current shell from here
    Ok("Please run 'source ~/.zshrc' in your terminal to reload the configuration.".to_string())
}
