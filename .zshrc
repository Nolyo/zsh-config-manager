# ~/.zshrc
# Main ZSH configuration entry point
# This file should remain minimal and only source other files

# Enable Powerlevel10k instant prompt (if using)
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Load machine-specific configuration FIRST
# (themes, plugins, PATH, environment variables)
[[ -f "$HOME/.zshrc.local" ]] && source "$HOME/.zshrc.local"

# Load shared configuration
[[ -f "$HOME/.zsh/config.zsh" ]] && source "$HOME/.zsh/config.zsh"

# Load shared aliases
[[ -f "$HOME/.zsh/aliases.zsh" ]] && source "$HOME/.zsh/aliases.zsh"

# Load machine-specific aliases
[[ -f "$HOME/.zsh/aliases.local.zsh" ]] && source "$HOME/.zsh/aliases.local.zsh"

# Load shared functions
[[ -f "$HOME/.zsh/functions.zsh" ]] && source "$HOME/.zsh/functions.zsh"

# Load machine-specific functions
[[ -f "$HOME/.zsh/functions.local.zsh" ]] && source "$HOME/.zsh/functions.local.zsh"

# Load secrets (tokens, API keys)
[[ -f "$HOME/.zshrc.secrets" ]] && source "$HOME/.zshrc.secrets"

# Load p10k configuration (if using)
[[ -f ~/.p10k.zsh ]] && source ~/.p10k.zsh
