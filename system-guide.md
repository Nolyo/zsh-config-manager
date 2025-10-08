# Modular ZSH Configuration System

## Overview

This system allows you to separate your ZSH configuration into modular, reusable components that can be shared across multiple machines while keeping machine-specific settings isolated.

## Architecture

### File Structure

```
~/
├── .zshrc                      # Main entry point (minimal, sources other files)
├── .zshrc.local               # Machine-specific configuration (not versioned)
├── .zshrc.secrets             # Secrets and tokens (not versioned)
└── .zsh/
    ├── aliases.zsh            # Shared aliases (versioned)
    ├── aliases.local.zsh      # Machine-specific aliases (not versioned)
    ├── functions.zsh          # Shared functions (versioned)
    ├── functions.local.zsh    # Machine-specific functions (not versioned)
    └── config.zsh             # Shared configuration (versioned)
```

### Files Description

#### Versioned Files (shared across machines)

- **`.zshrc`**: Minimal bootstrap file that sources all other configuration files
- **`.zsh/aliases.zsh`**: Common aliases used across all machines (docker, pnpm, git, etc.)
- **`.zsh/functions.zsh`**: Reusable shell functions
- **`.zsh/config.zsh`**: Common configuration settings

#### Local Files (machine-specific)

- **`.zshrc.local`**: Machine-specific settings (oh-my-zsh theme, plugins, PATH, environment variables)
- **`.zshrc.secrets`**: API keys, tokens, credentials
- **`.zsh/aliases.local.zsh`**: Machine-specific aliases (SSH hosts, local paths)
- **`.zsh/functions.local.zsh`**: Machine-specific functions

## Installation

### Initial Setup

1. **Create the directory structure**:
   ```bash
   mkdir -p ~/.zsh
   ```

2. **Initialize Git repository** (for versioned files):
   ```bash
   cd ~
   git init --bare ~/.dotfiles.git
   alias dotfiles='git --git-dir=$HOME/.dotfiles.git --work-tree=$HOME'
   dotfiles config status.showUntrackedFiles no
   ```

   Or create a separate `dotfiles` repository:
   ```bash
   mkdir ~/dotfiles
   cd ~/dotfiles
   git init
   ```

3. **Create the configuration files** (see Templates section below)

4. **Create `.gitignore`** for dotfiles repo:
   ```
   *.local.zsh
   .zshrc.local
   .zshrc.secrets
   .zsh_history
   .zcompdump*
   ```

### New Machine Setup

1. **Clone your dotfiles repository**:
   ```bash
   git clone <your-repo-url> ~/dotfiles
   ```

2. **Create symlinks**:
   ```bash
   ln -sf ~/dotfiles/.zshrc ~/.zshrc
   ln -sf ~/dotfiles/.zsh ~/.zsh
   ```

3. **Create local configuration files from templates**:
   ```bash
   cp ~/dotfiles/templates/.zshrc.local.template ~/.zshrc.local
   cp ~/dotfiles/templates/aliases.local.zsh.template ~/.zsh/aliases.local.zsh
   ```

4. **Edit local files** for machine-specific settings

5. **Reload shell**:
   ```bash
   source ~/.zshrc
   ```

## File Templates

### `.zshrc` (Main Entry Point)

```bash
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
```

### `.zshrc.local` Template

```bash
# ~/.zshrc.local
# Machine-specific configuration
# This file is NOT versioned

# ============================================
# OH-MY-ZSH CONFIGURATION
# ============================================

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"  # or "robbyrussell", etc.

# Plugins (machine-specific)
plugins=(
  zsh-autosuggestions
  zsh-syntax-highlighting
  git
  docker
)

# Load oh-my-zsh
source $ZSH/oh-my-zsh.sh

# ============================================
# PATH CONFIGURATION
# ============================================

# User binaries
export PATH="$HOME/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# PNPM
export PNPM_HOME="/home/nolyo/pnpm-global"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Console Ninja
export PATH="$HOME/.console-ninja/.bin:$PATH"

# ============================================
# ENVIRONMENT VARIABLES (MACHINE-SPECIFIC)
# ============================================

# WSL Audio (only for WSL machines)
export PULSE_RUNTIME_PATH="/mnt/wslg/PulseServer"
export PULSE_SERVER="unix:/mnt/wslg/PulseServer"

# Other machine-specific variables
# export DISPLAY=:0
# export EDITOR=nano
```

### `.zsh/aliases.zsh` (Shared Aliases)

```bash
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
```

### `.zsh/aliases.local.zsh` Template

```bash
# ~/.zsh/aliases.local.zsh
# Machine-specific aliases
# This file is NOT versioned

# ============================================
# SSH CONNECTIONS
# ============================================

# Example:
# alias myserver="ssh user@ip.address"
# alias nolys="ssh nolyo@69.197.160.226"

# ============================================
# NAVIGATION (MACHINE-SPECIFIC PATHS)
# ============================================

# Example:
# alias projects="cd ~/Projects"
# alias www="cd ~/www"
# alias work="cd ~/work"

# ============================================
# MACHINE-SPECIFIC TOOLS
# ============================================

# Example:
# alias zshconfig="nano ~/.zshrc"
# alias zshreload="source ~/.zshrc"
```

### `.zsh/functions.zsh` (Shared Functions)

```bash
# ~/.zsh/functions.zsh
# Shared shell functions
# This file IS versioned

# ============================================
# DOCKER FUNCTIONS
# ============================================

# Execute bash in a docker compose container
dcebash() {
  if [[ -z "$1" ]]; then
    echo "Usage: dcebash <container-name>"
    return 1
  fi
  docker compose exec "$1" bash
}

# Execute MySQL CLI in a docker compose container
dcebashmysql() {
  if [[ -z "$1" ]]; then
    echo "Usage: dcebashmysql <container-name>"
    return 1
  fi
  docker compose exec "$1" bash -c "mysql -p\$MYSQL_ROOT_PASSWORD \$MYSQL_DATABASE"
}

# Stop all running Docker containers
dka() {
  local containers=$(docker ps -q)
  if [[ -z "$containers" ]]; then
    echo "No running containers to stop"
    return 0
  fi
  docker stop $(docker ps -q)
}

# ============================================
# GIT FUNCTIONS
# ============================================

# Create a new branch and switch to it
gnb() {
  if [[ -z "$1" ]]; then
    echo "Usage: gnb <branch-name>"
    return 1
  fi
  git checkout -b "$1"
}

# Delete local branches that have been merged
gclean() {
  git branch --merged | grep -v "\*" | grep -v "main" | grep -v "master" | xargs -r git branch -d
}

# ============================================
# UTILITY FUNCTIONS
# ============================================

# Create directory and cd into it
mkcd() {
  if [[ -z "$1" ]]; then
    echo "Usage: mkcd <directory-name>"
    return 1
  fi
  mkdir -p "$1" && cd "$1"
}

# Find process using a specific port
port() {
  if [[ -z "$1" ]]; then
    echo "Usage: port <port-number>"
    return 1
  fi
  lsof -i ":$1"
}

# Kill process using a specific port
killport() {
  if [[ -z "$1" ]]; then
    echo "Usage: killport <port-number>"
    return 1
  fi
  lsof -ti ":$1" | xargs kill -9
}
```

### `.zsh/functions.local.zsh` Template

```bash
# ~/.zsh/functions.local.zsh
# Machine-specific functions
# This file is NOT versioned

# Add your machine-specific functions here
```

### `.zsh/config.zsh` (Shared Configuration)

```bash
# ~/.zsh/config.zsh
# Shared configuration settings
# This file IS versioned

# History configuration
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_SAVE_NO_DUPS
setopt SHARE_HISTORY

# Case-insensitive completion
autoload -Uz compinit && compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

# Enable correction
setopt CORRECT
setopt CORRECT_ALL

# Directory navigation
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
```

## Usage Guidelines

### Adding New Aliases

1. **Shared alias** (works on all machines):
   - Add to `~/.zsh/aliases.zsh`
   - Commit and push to Git

2. **Machine-specific alias** (SSH, paths, etc.):
   - Add to `~/.zsh/aliases.local.zsh`
   - Do NOT commit

### Adding New Functions

1. **Shared function** (useful everywhere):
   - Add to `~/.zsh/functions.zsh`
   - Commit and push to Git

2. **Machine-specific function**:
   - Add to `~/.zsh/functions.local.zsh`
   - Do NOT commit

### Organizing Aliases

Use comments to create sections:

```bash
# ============================================
# SECTION NAME
# ============================================
```

Group related aliases together (Docker, Git, pnpm, etc.)

### Best Practices

1. **Keep `.zshrc` minimal** - it should only source other files
2. **Document complex aliases/functions** with comments
3. **Use consistent naming conventions**:
   - Docker: `dc*` (docker compose), `d*` (docker)
   - Git: `g*`
   - pnpm: `p*`
4. **Test on a new machine** before committing shared files
5. **Never commit** `.local.*` files or `.secrets` files
6. **Use functions for complex operations** instead of multi-line aliases

## Syncing Across Machines

### First Time Setup

```bash
# On your main machine (after creating files)
cd ~/dotfiles
git add .zshrc .zsh/aliases.zsh .zsh/functions.zsh .zsh/config.zsh
git commit -m "Initial dotfiles setup"
git remote add origin <your-repo-url>
git push -u origin main
```

### Pulling Updates

```bash
cd ~/dotfiles
git pull
source ~/.zshrc
```

### Pushing Updates

```bash
cd ~/dotfiles
git add -A
git commit -m "Update aliases"
git push
```

## Troubleshooting

### Changes Not Taking Effect

```bash
# Reload ZSH configuration
source ~/.zshrc

# Or restart shell
exec zsh
```

### Permission Denied

```bash
# Make sure files are executable
chmod +x ~/.zsh/*.zsh
```

### Alias Not Found

1. Check if alias is in correct file (shared vs local)
2. Check if file is being sourced in `.zshrc`
3. Look for typos in file names
4. Reload configuration: `source ~/.zshrc`

### Git Issues

```bash
# Check which files are tracked
cd ~/dotfiles
git status

# Check .gitignore
cat .gitignore

# Verify .local files are ignored
git check-ignore -v .zsh/aliases.local.zsh
```

## Future Automation App

This documentation serves as the foundation for an automation tool that will:

- **Interactive setup wizard** for new machines
- **Config validator** to check for conflicts or missing files
- **Alias browser** to search and manage aliases
- **Sync manager** to handle git operations
- **Backup/restore** functionality
- **Migration tool** from existing `.zshrc` to modular structure
- **Conflict resolver** when merging configurations

### App Configuration Schema

```json
{
  "version": "1.0.0",
  "machines": [
    {
      "id": "work-laptop",
      "hostname": "work-machine",
      "profile": "work",
      "sync_enabled": true
    },
    {
      "id": "home-desktop",
      "hostname": "nolyo-wsl",
      "profile": "personal",
      "sync_enabled": true
    }
  ],
  "shared_files": [
    ".zshrc",
    ".zsh/aliases.zsh",
    ".zsh/functions.zsh",
    ".zsh/config.zsh"
  ],
  "local_files": [
    ".zshrc.local",
    ".zsh/aliases.local.zsh",
    ".zsh/functions.local.zsh"
  ],
  "git": {
    "repository": "git@github.com:username/dotfiles.git",
    "branch": "main",
    "auto_sync": false
  }
}
```

## Examples

### Example: Adding a New Project Alias

**Work machine** (`~/.zsh/aliases.local.zsh`):
```bash
alias myproject="cd ~/work/my-project && pnpm run dev"
```

**Home machine** (`~/.zsh/aliases.local.zsh`):
```bash
alias myproject="cd ~/www/my-project && pnpm run dev"
```

Both machines can use `myproject` but point to different paths.

### Example: Shared Docker Cleanup Function

In `~/.zsh/functions.zsh` (shared):
```bash
docker-cleanup() {
  echo "Removing stopped containers..."
  docker container prune -f

  echo "Removing unused images..."
  docker image prune -a -f

  echo "Removing unused volumes..."
  docker volume prune -f

  echo "Removing unused networks..."
  docker network prune -f

  echo "Docker cleanup complete!"
}
```

Available on all machines after sync.

## Migration Guide

### Migrating Existing Configuration

1. **Backup current configuration**:
   ```bash
   cp ~/.zshrc ~/.zshrc.backup
   ```

2. **Analyze current `.zshrc`**:
   - Identify shared aliases → move to `.zsh/aliases.zsh`
   - Identify machine-specific aliases → move to `.zsh/aliases.local.zsh`
   - Identify functions → move to `.zsh/functions.zsh`
   - Identify oh-my-zsh config → move to `.zshrc.local`

3. **Create new structure** using templates above

4. **Test thoroughly**:
   ```bash
   source ~/.zshrc
   # Test all your common commands
   ```

5. **Commit to Git** once satisfied

## Version History

- **v1.0.0** (2025-10-07): Initial documentation
  - Modular file structure
  - Separation of shared vs local configuration
  - Templates for all configuration files
  - Migration guide
  - Future app planning

## Contributing

When sharing this system with others:

1. Keep templates up to date
2. Document any new conventions
3. Add examples for common use cases
4. Keep this documentation in sync with actual implementation
