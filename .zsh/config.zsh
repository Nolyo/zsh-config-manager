# ~/.zsh/config.zsh
# Shared configuration settings
# This file IS versioned

# ============================================
# HISTORY CONFIGURATION
# ============================================

HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_SAVE_NO_DUPS
setopt SHARE_HISTORY

# ============================================
# COMPLETION
# ============================================

# Core completion + liste interactive
zmodload zsh/complist

zstyle ':completion:*' matcher-list \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]}' \
  'r:|=*' \
  'l:|=* r:|=*'

autoload -Uz compinit _files
compdef _files code
compdef _files cursor   # si tu utilises Cursor

compinit -i

# ============================================
# ZSH OPTIONS
# ============================================

# Enable correction
setopt CORRECT
setopt CORRECT_ALL

# Directory navigation
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS

