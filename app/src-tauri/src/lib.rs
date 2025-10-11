mod commands;

use commands::alias::{list_aliases, add_alias, update_alias, delete_alias, list_secrets_aliases};
use commands::function::{list_functions, add_function, update_function, delete_function};
use commands::config::{get_config, update_config, reload_zsh};
use commands::git::{git_status, git_pull, git_push, git_commit, git_log, git_diff, git_init};
use commands::plugin::{get_plugins, get_popular_plugins, add_plugin, remove_plugin, open_url_wsl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_aliases,
            add_alias,
            update_alias,
            delete_alias,
            list_secrets_aliases,
            list_functions,
            add_function,
            update_function,
            delete_function,
            get_config,
            update_config,
            reload_zsh,
            git_status,
            git_pull,
            git_push,
            git_commit,
            git_log,
            git_diff,
            git_init,
            get_plugins,
            get_popular_plugins,
            add_plugin,
            remove_plugin,
            open_url_wsl,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
