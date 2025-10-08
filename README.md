# ZSH Config Manager

Une application desktop moderne pour gérer votre configuration ZSH à travers plusieurs machines. Construite avec **Tauri**, **React**, **TypeScript**, et **Tailwind CSS**.

![ZSH Config Manager](docs/screenshot.png)

## ✨ Fonctionnalités

### 🔧 Gestion des Aliases
- ✅ Créer, éditer et supprimer des aliases
- ✅ Séparation aliases partagés (versionnés) / locaux
- ✅ Recherche et filtrage en temps réel
- ✅ Support des secrets (`.zshrc.secrets`)

### ⚡ Gestion des Functions
- ✅ Éditeur de code avec coloration syntaxique (Monaco Editor)
- ✅ Créer, éditer et supprimer des fonctions shell
- ✅ Séparation fonctions partagées / locales

### ⚙️ Gestion de Configuration
- ✅ Éditeur de configuration ZSH (`.zshrc`)
- ✅ Édition de configs partagées et locales
- ✅ Reload ZSH en un clic

### 🔄 Synchronisation Git
- ✅ Statut Git en temps réel (auto-refresh toutes les 5s)
- ✅ Commit, pull, et push depuis l'interface
- ✅ Historique des commits
- ✅ Affichage des fichiers modifiés/untracked
- ✅ Badge de statut visuel (Clean/Changes)
- ✅ Initialisation Git intégrée

### 🎨 Interface Moderne
- ✅ Mode sombre/clair avec toggle
- ✅ Interface responsive et intuitive
- ✅ Notifications toast pour toutes les actions
- ✅ États de chargement avec React Query
- ✅ Design shadcn/ui

## 🚀 Installation

### Prérequis

- **Node.js** 20.19+ ou 22.12+
- **pnpm** (gestionnaire de paquets)
- **Rust** et **Cargo** (pour Tauri)
- **Git**
- **xdg-utils** (pour le build Linux)

```bash
# Installer pnpm si nécessaire
npm install -g pnpm

# Installer Rust si nécessaire
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Installer xdg-utils (requis pour créer l'AppImage)
sudo apt-get update && sudo apt-get install -y xdg-utils
```

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <votre-repo-url>
cd zsh-config-manager
```

2. **Installer les dépendances**
```bash
cd app
pnpm install
```

3. **Lancer en mode développement**
```bash
pnpm tauri dev
```

4. **Build de production**
```bash
pnpm tauri build
```

Le build génère 3 formats de packages :
- **`.deb`** - Pour Ubuntu/Debian (WSL)
- **`.rpm`** - Pour RedHat/Fedora 
- **`.AppImage`** - Format portable (fonctionne partout)

Fichiers générés dans `app/src-tauri/target/release/` :
- `app` - Binaire exécutable direct
- `bundle/deb/ZSH Config Manager_0.1.0_amd64.deb`
- `bundle/rpm/ZSH Config Manager-0.1.0-1.x86_64.rpm`
- `bundle/appimage/ZSH Config Manager_0.1.0_amd64.AppImage`

## 📦 Configuration

### Structure des fichiers ZSH

```
~/.zsh/
├── aliases.zsh         # Aliases partagés (versionnés)
├── aliases.local.zsh   # Aliases locaux (non versionnés)
├── functions.zsh       # Functions partagées (versionnées)
├── functions.local.zsh # Functions locales (non versionnées)
├── config.zsh          # Config partagée (versionnée)
└── config.local.zsh    # Config locale (non versionnée)

~/.zshrc.secrets        # Fichier de secrets (non versionné)
```

### Bootstrap ZSH

Votre `~/.zshrc` doit sourcer les fichiers de configuration :

```bash
# Load shared config (versioned)
[[ -f ~/.zsh/config.zsh ]] && source ~/.zsh/config.zsh

# Load local config (not versioned)
[[ -f ~/.zsh/config.local.zsh ]] && source ~/.zsh/config.local.zsh

# Load shared aliases (versioned)
[[ -f ~/.zsh/aliases.zsh ]] && source ~/.zsh/aliases.zsh

# Load local aliases (not versioned)
[[ -f ~/.zsh/aliases.local.zsh ]] && source ~/.zsh/aliases.local.zsh

# Load shared functions (versioned)
[[ -f ~/.zsh/functions.zsh ]] && source ~/.zsh/functions.zsh

# Load local functions (not versioned)
[[ -f ~/.zsh/functions.local.zsh ]] && source ~/.zsh/functions.local.zsh

# Load secrets (passwords, tokens, etc.) - not versioned
[[ -f ~/.zshrc.secrets ]] && source ~/.zshrc.secrets
```

## 🎯 Utilisation

### Lancer l'application

**En développement :**
```bash
cd app
pnpm tauri dev
```

**En production (après build) :**

Il existe 3 méthodes pour lancer l'application :

**Option 1 - Binaire direct (rapide, pas d'installation)** :
```bash
cd app/src-tauri/target/release
./zsh-config-manager
```

**Option 2 - AppImage (portable)** :
```bash
cd app/src-tauri/target/release/bundle/appimage
chmod +x "ZSH Config Manager_0.1.0_amd64.AppImage"
./ZSH\ Config\ Manager_0.1.0_amd64.AppImage
```

**Option 3 - Installation .deb (propre, recommandé pour Ubuntu/WSL)** :
```bash
cd app/src-tauri/target/release/bundle/deb
sudo dpkg -i "ZSH Config Manager_0.1.0_amd64.deb"
# Ensuite, lancer depuis n'importe où :
zsh-config-manager

# Pour désinstaller :
sudo dpkg -r zsh-config-manager
```

**Note WSL** : L'interface graphique fonctionne dans WSL si `pnpm tauri dev` fonctionnait (WSLg sur Windows 11, ou serveur X11 sur Windows 10).

### Onglets de l'application

#### 1. **Aliases** 🔤
- Gérez vos aliases shell partagés et locaux
- Recherchez et filtrez par scope (all/shared/local)
- Créez, éditez, supprimez avec des dialogs intuitifs

#### 2. **Functions** ⚡
- Éditeur de code complet avec Monaco
- Syntaxe highlighting pour Bash/ZSH
- Gestion des fonctions partagées et locales

#### 3. **Config** ⚙️
- Éditez directement vos fichiers de configuration
- Switch entre config partagée et locale
- Rechargez votre ZSH sans quitter l'app

#### 4. **Export/Git** 🔄
- **Statut Git en temps réel**
  - Branch actuelle
  - Commits ahead/behind
  - Fichiers modifiés et untracked
- **Opérations Git**
  - Commit avec message personnalisé
  - Pull/Push en un clic
  - Historique des commits
- **Export/Import** (à venir)

## 🛠️ Technologies

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Monaco Editor** - Code editor
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **Tauri 2.0** - Desktop framework
- **Rust** - Backend logic
- **serde** - JSON serialization

## 📝 Développement

### Scripts disponibles

```bash
# Développement avec hot-reload
pnpm tauri dev

# Build de production
pnpm tauri build

# Vérification TypeScript
pnpm exec tsc --noEmit

# Vérification Rust
cargo check
```

### Architecture

```
app/
├── src/
│   ├── components/
│   │   ├── tabs/          # Composants des onglets
│   │   └── ui/            # Composants shadcn/ui
│   ├── lib/
│   │   ├── hooks/         # React Query hooks
│   │   ├── types.ts       # Types TypeScript
│   │   └── tauri.ts       # API Tauri
│   ├── contexts/          # React contexts (theme)
│   └── App.tsx
└── src-tauri/
    └── src/
        ├── commands/       # Commandes Tauri (Rust)
        │   ├── alias.rs
        │   ├── function.rs
        │   ├── config.rs
        │   └── git.rs
        └── lib.rs
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🎉 Credits

Développé avec ❤️ pour faciliter la gestion de configuration ZSH.

---

**Status du projet** : ~90% complet - Application fonctionnelle avec toutes les fonctionnalités principales implémentées.
