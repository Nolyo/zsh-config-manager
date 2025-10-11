use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use regex::Regex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Plugin {
    pub name: String,
    pub enabled: bool,
    pub installed: bool,
    pub description: Option<String>,
    pub repository: Option<String>,
    pub manager: PluginManager,
    pub install_command: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum PluginManager {
    OhMyZsh,
    Zinit,
    Custom,
}

fn get_home_dir() -> PathBuf {
    dirs::home_dir().expect("Could not find home directory")
}

fn get_zshrc_local_path() -> PathBuf {
    get_home_dir().join(".zshrc.local")
}

fn get_oh_my_zsh_plugins_dir() -> PathBuf {
    get_home_dir().join(".oh-my-zsh/plugins")
}

fn get_oh_my_zsh_custom_plugins_dir() -> PathBuf {
    get_home_dir().join(".oh-my-zsh/custom/plugins")
}

/// Parse the plugins array from .zshrc.local
fn parse_plugins_from_file(content: &str) -> Vec<String> {
    let re = Regex::new(r"plugins=\(\s*([^)]*)\s*\)").unwrap();

    if let Some(captures) = re.captures(content) {
        if let Some(plugins_str) = captures.get(1) {
            return plugins_str
                .as_str()
                .split_whitespace()
                .map(|s| s.to_string())
                .collect();
        }
    }

    Vec::new()
}

/// Check if a plugin is installed in oh-my-zsh
fn is_plugin_installed(plugin_name: &str) -> bool {
    let builtin_path = get_oh_my_zsh_plugins_dir().join(plugin_name);
    let custom_path = get_oh_my_zsh_custom_plugins_dir().join(plugin_name);

    builtin_path.exists() || custom_path.exists()
}

/// Get popular plugin information
fn get_plugin_info(name: &str) -> (Option<String>, Option<String>, Option<String>) {
    match name {
        "git" => (
            Some("Git aliases and functions".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "zsh-autosuggestions" => (
            Some("Fish-like autosuggestions for zsh".to_string()),
            Some("https://github.com/zsh-users/zsh-autosuggestions".to_string()),
            Some("cd ~/.oh-my-zsh/custom/plugins\ngit clone https://github.com/zsh-users/zsh-autosuggestions".to_string()),
        ),
        "zsh-syntax-highlighting" => (
            Some("Fish shell like syntax highlighting for Zsh".to_string()),
            Some("https://github.com/zsh-users/zsh-syntax-highlighting".to_string()),
            Some("cd ~/.oh-my-zsh/custom/plugins\ngit clone https://github.com/zsh-users/zsh-syntax-highlighting.git".to_string()),
        ),
        "alias-tips" => (
            Some("Help remember your aliases by showing tips when you type a command".to_string()),
            Some("https://github.com/djui/alias-tips".to_string()),
            Some("cd ~/.oh-my-zsh/custom/plugins\ngit clone https://github.com/djui/alias-tips.git".to_string()),
        ),
        "fzf" => (
            Some("Fuzzy finder integration for command history and file search".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/fzf".to_string()),
            Some("Built-in Oh-My-Zsh plugin - requires fzf to be installed:\nsudo apt install fzf  # Ubuntu/Debian\nbrew install fzf      # macOS".to_string()),
        ),
        "fzf-tab" => (
            Some("Replace zsh tab completion with fzf".to_string()),
            Some("https://github.com/Aloxaf/fzf-tab".to_string()),
            Some("cd ~/.oh-my-zsh/custom/plugins\ngit clone https://github.com/Aloxaf/fzf-tab".to_string()),
        ),
        "docker" => (
            Some("Docker completion and aliases".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/docker".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "docker-compose" => (
            Some("Docker-compose completion".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/docker-compose".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "kubectl" => (
            Some("Kubectl completion and aliases".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/kubectl".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "npm" => (
            Some("NPM completion and aliases".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/npm".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "node" => (
            Some("Node.js completion".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/node".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "rust" => (
            Some("Rust and Cargo completion".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/rust".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "python" => (
            Some("Python completion and utilities".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/python".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "sudo" => (
            Some("Easily prefix your commands with sudo by pressing ESC twice".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/sudo".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "web-search" => (
            Some("Search the web from your terminal".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/web-search".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "history" => (
            Some("Enhanced history utilities".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/history".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "colored-man-pages" => (
            Some("Colorize man pages".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/colored-man-pages".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        "command-not-found" => (
            Some("Suggest package to install when command not found".to_string()),
            Some("https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/command-not-found".to_string()),
            Some("Built-in Oh-My-Zsh plugin - no installation required".to_string()),
        ),
        _ => (None, None, None),
    }
}

#[tauri::command]
pub fn get_plugins() -> Result<Vec<Plugin>, String> {
    let file_path = get_zshrc_local_path();

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read .zshrc.local: {}", e))?;

    let enabled_plugins = parse_plugins_from_file(&content);

    let mut plugins: Vec<Plugin> = enabled_plugins
        .iter()
        .map(|name| {
            let installed = is_plugin_installed(name);
            let (description, repository, install_command) = get_plugin_info(name);

            Plugin {
                name: name.clone(),
                enabled: true,
                installed,
                description,
                repository,
                manager: PluginManager::OhMyZsh,
                install_command,
            }
        })
        .collect();

    plugins.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(plugins)
}

#[tauri::command]
pub fn get_popular_plugins() -> Result<Vec<Plugin>, String> {
    let enabled_plugins = get_plugins()?;
    let enabled_names: Vec<String> = enabled_plugins.iter().map(|p| p.name.clone()).collect();

    let popular = vec![
        "git", "zsh-autosuggestions", "zsh-syntax-highlighting",
        "alias-tips", "fzf", "fzf-tab",
        "docker", "docker-compose", "kubectl", "npm", "node",
        "rust", "python", "sudo", "web-search", "history",
        "colored-man-pages", "command-not-found",
    ];

    let mut plugins: Vec<Plugin> = popular
        .iter()
        .filter(|name| !enabled_names.contains(&name.to_string()))
        .map(|name| {
            let installed = is_plugin_installed(name);
            let (description, repository, install_command) = get_plugin_info(name);

            Plugin {
                name: name.to_string(),
                enabled: false,
                installed,
                description,
                repository,
                manager: PluginManager::OhMyZsh,
                install_command,
            }
        })
        .collect();

    plugins.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(plugins)
}

#[tauri::command]
pub fn add_plugin(plugin_name: String) -> Result<(), String> {
    let file_path = get_zshrc_local_path();

    if !file_path.exists() {
        return Err("~/.zshrc.local does not exist".to_string());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read .zshrc.local: {}", e))?;

    let mut plugins = parse_plugins_from_file(&content);

    if plugins.contains(&plugin_name) {
        return Err(format!("Plugin '{}' is already enabled", plugin_name));
    }

    plugins.push(plugin_name);
    plugins.sort();

    let new_plugins_str = plugins.join("\n  ");
    let new_plugins_block = format!("plugins=(\n  {}\n)", new_plugins_str);

    let re = Regex::new(r"plugins=\(\s*([^)]*)\s*\)").unwrap();
    let new_content = re.replace(&content, new_plugins_block.as_str()).to_string();

    fs::write(&file_path, new_content)
        .map_err(|e| format!("Failed to write .zshrc.local: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn remove_plugin(plugin_name: String) -> Result<(), String> {
    let file_path = get_zshrc_local_path();

    if !file_path.exists() {
        return Err("~/.zshrc.local does not exist".to_string());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read .zshrc.local: {}", e))?;

    let mut plugins = parse_plugins_from_file(&content);

    if !plugins.contains(&plugin_name) {
        return Err(format!("Plugin '{}' is not enabled", plugin_name));
    }

    plugins.retain(|p| p != &plugin_name);

    let new_plugins_str = if plugins.is_empty() {
        String::new()
    } else {
        plugins.join("\n  ")
    };

    let new_plugins_block = if new_plugins_str.is_empty() {
        "plugins=()".to_string()
    } else {
        format!("plugins=(\n  {}\n)", new_plugins_str)
    };

    let re = Regex::new(r"plugins=\(\s*([^)]*)\s*\)").unwrap();
    let new_content = re.replace(&content, new_plugins_block.as_str()).to_string();

    fs::write(&file_path, new_content)
        .map_err(|e| format!("Failed to write .zshrc.local: {}", e))?;

    Ok(())
}

/// Open a URL in the default browser (WSL-compatible)
#[tauri::command]
pub fn open_url_wsl(url: String) -> Result<(), String> {
    // In WSL, we need to use Windows commands to open URLs
    // Try multiple methods to ensure compatibility

    // Method 1: Try wslview (if wslu is installed)
    let wslview_result = Command::new("wslview")
        .arg(&url)
        .spawn();

    if wslview_result.is_ok() {
        return Ok(());
    }

    // Method 2: Try cmd.exe with start
    let cmd_result = Command::new("cmd.exe")
        .args(&["/C", "start", &url])
        .spawn();

    if cmd_result.is_ok() {
        return Ok(());
    }

    // Method 3: Try powershell.exe with Start-Process
    let ps_result = Command::new("powershell.exe")
        .args(&["-Command", &format!("Start-Process '{}'", url)])
        .spawn();

    if ps_result.is_ok() {
        return Ok(());
    }

    // Method 4: Fallback to xdg-open (for native Linux)
    let xdg_result = Command::new("xdg-open")
        .arg(&url)
        .spawn();

    if xdg_result.is_ok() {
        return Ok(());
    }

    Err("Failed to open URL: no suitable method found".to_string())
}
