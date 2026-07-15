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
    ├── engine.rs (main de l'execution)
    |
    ├── Definitions (les constante et definition du jeux)
    |
    ├── State (L'état du jeux)
    |
    ├── ECS (Entity Component System: element composant le jeu) 
    |
    ├── Systems (calcule, logi(que/stique), rendu)
    |
    ├── Events (les truc a trigger)
    |
    ├── Views (le back for front, le maniment des données structurer)
    |
    └── Commands (les activable
```