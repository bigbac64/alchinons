# Tauri + React

This template should help get you started developing with Tauri and React in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Dependency Linux 

```bash
sudo apt install \
    build-essential \
    pkg-config \
    libwebkit2gtk-4.1-dev \
    curl \
    wget \
    file \
    libssl-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgtk-3-dev \
    libgdk-pixbuf2.0-dev \
    libatk1.0-dev \
    libglib2.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libsoup-3.0-dev
```

## Architecture development

Voir [`ARCHITECTURE_GUIDELINES.md`](./ARCHITECTURE_GUIDELINES.md) pour la référence complète (principes, règles de développement, documentation). Résumé :

```
React
    |
    | UI + affichage
    |
Tauri
    |
    |
Engine
    |
    ├── engine.rs (composition root : routage des Command)
    ├── state.rs  (composition de l'état de jeu, un champ par domaine)
    |
    ├── position.rs, resource.rs (types transverses partagés par tous les domaines)
    ├── commands/  (enum Command + CommandOutput : entrée/sortie du moteur)
    ├── events/    (enum Event : notifications asynchrones vers le frontend)
    |
    └── un dossier par domaine de jeu, chacun avec ses propres
        command / model / state / system / view (motif "CMSSV") :
        ├── player/     (état du joueur)
        ├── craft/      (recettes, artisanat)
        ├── inventory/  (inventaires, transferts)
        ├── world/      (carte, tuiles, terrain)
        ├── movement/   (déplacement du joueur, pathfinding)
        └── gather/     (cueillette/récolte, résolution de loot)
```