use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Function {
    pub name: String,
    pub content: String,
    pub shared: bool,
}

fn get_home_dir() -> PathBuf {
    dirs::home_dir().expect("Could not find home directory")
}

fn get_function_file_path(shared: bool) -> PathBuf {
    let home = get_home_dir();
    if shared {
        home.join(".zsh/functions.zsh")
    } else {
        home.join(".zsh/functions.local.zsh")
    }
}

fn parse_functions(content: &str) -> Vec<Function> {
    let mut functions = Vec::new();
    let lines: Vec<&str> = content.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i].trim();

        // Look for function definition: "function name() {" or "name() {"
        if let Some(function) = try_parse_function_start(line) {
            let func_name = function;
            let mut func_content = String::new();
            let mut brace_count = 0;
            let mut started = false;

            // Start from current line to capture the opening brace
            let mut j = i;
            while j < lines.len() {
                let current_line = lines[j];

                // Count braces
                for ch in current_line.chars() {
                    if ch == '{' {
                        brace_count += 1;
                        started = true;
                    } else if ch == '}' {
                        brace_count -= 1;
                    }
                }

                // Add line to content (excluding the function declaration line)
                if j > i {
                    if !func_content.is_empty() {
                        func_content.push('\n');
                    }
                    func_content.push_str(current_line);
                }

                // Check if function is complete
                if started && brace_count == 0 {
                    // Remove the closing brace from content
                    if let Some(last_brace) = func_content.rfind('}') {
                        func_content.truncate(last_brace);
                        func_content = func_content.trim_end().to_string();
                    }

                    functions.push(Function {
                        name: func_name.clone(),
                        content: func_content.trim().to_string(),
                        shared: false, // Will be set by caller
                    });
                    i = j;
                    break;
                }

                j += 1;
            }
        }

        i += 1;
    }

    functions
}

fn try_parse_function_start(line: &str) -> Option<String> {
    let line = line.trim();

    // Skip comments and empty lines
    if line.starts_with('#') || line.is_empty() {
        return None;
    }

    // Pattern 1: "function name() {"
    if line.starts_with("function ") {
        let rest = line.strip_prefix("function ")?.trim();
        if let Some(paren_pos) = rest.find('(') {
            let name = rest[..paren_pos].trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
    }

    // Pattern 2: "name() {"
    if let Some(paren_pos) = line.find('(') {
        let name = line[..paren_pos].trim();
        if !name.is_empty() && !name.starts_with('#') {
            // Make sure it's followed by ") {" or similar
            let after_paren = &line[paren_pos..];
            if after_paren.starts_with("()") {
                return Some(name.to_string());
            }
        }
    }

    None
}

#[tauri::command]
pub fn list_functions(shared: bool) -> Result<Vec<Function>, String> {
    let file_path = get_function_file_path(shared);

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read function file: {}", e))?;

    let functions: Vec<Function> = parse_functions(&content)
        .into_iter()
        .map(|mut func| {
            func.shared = shared;
            func
        })
        .collect();

    Ok(functions)
}

#[tauri::command]
pub fn add_function(name: String, content: String, shared: bool) -> Result<(), String> {
    let file_path = get_function_file_path(shared);

    // Check if function already exists
    let existing_functions = list_functions(shared)?;
    if existing_functions.iter().any(|f| f.name == name) {
        return Err(format!("Function '{}' already exists", name));
    }

    // Read existing content
    let mut file_content = if file_path.exists() {
        fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read file: {}", e))?
    } else {
        String::new()
    };

    // Add new function
    if !file_content.ends_with('\n') && !file_content.is_empty() {
        file_content.push('\n');
    }

    // Add empty line before function for readability
    if !file_content.is_empty() {
        file_content.push('\n');
    }

    file_content.push_str(&format!("function {}() {{\n", name));

    // Indent content
    for line in content.lines() {
        if !line.trim().is_empty() {
            file_content.push_str("  ");
            file_content.push_str(line);
        }
        file_content.push('\n');
    }

    file_content.push_str("}\n");

    // Write back
    fs::write(&file_path, file_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn update_function(name: String, content: String, shared: bool) -> Result<(), String> {
    let file_path = get_function_file_path(shared);

    if !file_path.exists() {
        return Err("Function file not found".to_string());
    }

    // Read and parse existing functions
    let file_content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let mut functions = parse_functions(&file_content);

    // Find and update the function
    let mut found = false;
    for func in &mut functions {
        if func.name == name {
            func.content = content.clone();
            found = true;
            break;
        }
    }

    if !found {
        return Err(format!("Function '{}' not found", name));
    }

    // Rebuild file content
    let mut new_content = String::new();
    for (i, func) in functions.iter().enumerate() {
        if i > 0 {
            new_content.push('\n');
        }

        new_content.push_str(&format!("function {}() {{\n", func.name));

        // Indent content
        for line in func.content.lines() {
            if !line.trim().is_empty() {
                new_content.push_str("  ");
                new_content.push_str(line);
            }
            new_content.push('\n');
        }

        new_content.push_str("}\n");
    }

    fs::write(&file_path, new_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn delete_function(name: String, shared: bool) -> Result<(), String> {
    let file_path = get_function_file_path(shared);

    if !file_path.exists() {
        return Err("Function file not found".to_string());
    }

    // Read and parse existing functions
    let file_content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let functions = parse_functions(&file_content);

    // Filter out the function to delete
    let filtered: Vec<Function> = functions
        .into_iter()
        .filter(|f| f.name != name)
        .collect();

    if filtered.len() == parse_functions(&file_content).len() {
        return Err(format!("Function '{}' not found", name));
    }

    // Rebuild file content
    let mut new_content = String::new();
    for (i, func) in filtered.iter().enumerate() {
        if i > 0 {
            new_content.push('\n');
        }

        new_content.push_str(&format!("function {}() {{\n", func.name));

        // Indent content
        for line in func.content.lines() {
            if !line.trim().is_empty() {
                new_content.push_str("  ");
                new_content.push_str(line);
            }
            new_content.push('\n');
        }

        new_content.push_str("}\n");
    }

    fs::write(&file_path, new_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}
