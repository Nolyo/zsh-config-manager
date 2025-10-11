# ~/.zsh/aliases.zsh
# Shared aliases across all machines
# This file IS versioned

# ============================================
# DOCKER & DOCKER COMPOSE
# ============================================

alias dc="docker compose"
alias dcu="docker compose up -d"
alias dcd="docker compose down"
alias dcl="docker compose logs -f"
alias dcln="dcl -n 100"
alias dps="docker ps"
alias dimg="docker images"

# ============================================
# PNPM
# ============================================

alias pdev="pnpm run dev"
alias plint="pnpm run lint"
alias pbuild="pnpm run build"
alias ptest="pnpm run test"
alias pinstall="pnpm install"

# ============================================
# GIT
# ============================================

alias gs="git status"
alias gp="git pull"
alias gps="git push"
alias gc="git commit"
alias gca="git commit --amend"
alias gco="git checkout"
alias gb="git branch"
alias glog="git log --oneline --graph --decorate"

# ============================================
# NAVIGATION
# ============================================

alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias home="cd ~"
alias www="cd ~/www/"
alias kering="cd ~/work/"
alias cdwin="cd /mnt/c/Users/jaffr/Local\ Sites"
alias zshconfig="code ~/zsh-config-manager"

# ============================================
# SYSTEM
# ============================================

alias ll="ls -alh"
alias la="ls -A"
alias l="ls -CF"
alias cls="clear"

# ============================================
# CLAUDE
# ============================================

alias cc="claude"
alias ccc="claude -c"
alias ccr="claude -r"
alias ccs="claude --dangerously-skip-permissions"
alias dka="docker kill $(docker ps -q)"
