# Projet : Jeu solo desktop — Architecture de référence

## Objectif

Créer un jeu solo desktop avec une architecture capable d'évoluer :

* interface graphique moderne
* moteur de jeu indépendant
* logique métier séparée
* possibilité future d'ajouter :

    * sauvegarde
    * replay
    * serveur
    * éditeur
    * IA complexe

Technologies :

* **Frontend** : React + TypeScript
* **Desktop wrapper** : Tauri
* **Moteur** : Rust
* **Communication** : Tauri `invoke` + `event`

---

# Architecture globale

```text
                 React
                   |
                   |
            invoke / listen
                   |
                   v

                 Tauri
        (adaptateur desktop)
                   |
                   |
                   v

              GameEngine
              (Rust)

                   |
       +-----------+-----------+
       |                       |
       v                       v

    Commands               Events

       |
       v

    Systems

       |
       v

   GameState
```

---

# Règle principale

Chaque couche a une responsabilité unique.

| Élément    | Responsabilité                      |
| ---------- | ----------------------------------- |
| React      | affichage + interaction utilisateur |
| Tauri      | pont JS/Rust + accès desktop        |
| Command    | intention du joueur                 |
| GameEngine | orchestration                       |
| System     | règles métier                       |
| State      | données actuelles du monde          |
| Event      | notification d'un changement        |
| Model      | objets métier                       |
| Definition | données statiques                   |

---

# Structure projet cible

```text
mon-jeu/

├── src/                    # React
│
├── src-tauri/              # Tauri
│   ├── main.rs
│   ├── app_state.rs
│   ├── commands/
│   │   └── engine.rs
│   └── events/
│
├── game-engine/
│
│   ├── engine.rs
│   │
│   ├── command/
│   │   └── mod.rs
│   │
│   ├── system/
│   │   ├── gather.rs
│   │   ├── inventory.rs
│   │   ├── movement.rs
│   │   └── combat.rs
│   │
│   ├── state/
│   │   ├── mod.rs
│   │   ├── game_state.rs
│   │   ├── world.rs
│   │   ├── inventory.rs
│   │   └── entity.rs
│   │
│   ├── model/
│   │   ├── inventory.rs
│   │   ├── loot.rs
│   │   └── resource.rs
│   │
│   ├── definition/
│   │   ├── terrain.rs
│   │   └── item.rs
│   │
│   └── event/
│       ├── mod.rs
│       └── inventory.rs
```

---

# Workspace Cargo

Racine :

```toml
[workspace]

members = [
    "src-tauri",
    "game-engine"
]

resolver = "2"
```

Le moteur est une librairie :

```bash
cargo new game-engine --lib
```

---

# Séparation Tauri / Engine

Principe fondamental :

Correct :

```text
Tauri
 |
 v
GameEngine
 |
 v
GameState
```

Incorrect :

```text
GameEngine
 |
 v
Tauri
```

Le moteur doit pouvoir fonctionner sans Tauri.

---

# GameEngine

Le moteur possède :

```rust
pub struct GameEngine {

    state: GameState,

    systems: Systems,

    events: Vec<GameEvent>,
}
```

Il est créé dans Tauri :

```rust
AppState {
    engine: Mutex<GameEngine>
}
```

---

# AppState Tauri

`src-tauri/app_state.rs`

```rust
pub struct AppState {

    pub engine: Mutex<GameEngine>

}
```

Initialisation :

```rust
tauri::Builder::default()

.manage(
    AppState {
        engine: Mutex::new(
            GameEngine::new()
        )
    }
)
```

---

# Command

Une commande représente une intention.

Exemple :

```rust
pub enum Command {

    Gather,

    Move(Direction),

    Attack(EntityId)

}
```

Une commande ne contient pas de logique.

Pas :

```rust
Move {
    new_position
}
```

mais :

```rust
Move {
    direction
}
```

---

# Flux Command

## React

```typescript
invoke("execute", {
    command:"Gather"
})
```

---

## Tauri

```rust
#[tauri::command]
pub fn execute(
    state: State<AppState>,
    command: Command
)
```

---

## GameEngine

```rust
pub fn execute(
    &mut self,
    command: Command
)
{
    match command {

        Command::Gather =>
            self.systems
                .gather
                .execute(
                    &mut self.state
                )

    }
}
```

---

# System

Un system représente une action complète.

Exemples :

```
GatherSystem
MovementSystem
CombatSystem
CraftSystem
```

Un system orchestre plusieurs composants.

---

## Exemple Gather

Flux :

```text
Command::Gather

        |

        v

GatherSystem

        |

        +-- vérifie terrain
        |
        +-- appelle LootGenerator
        |
        +-- InventorySystem
        |
        +-- génère Event
```

---

# Services / Models

Ne pas tout appeler System.

Un calcul pur devient un service.

Exemple :

Mauvais :

```
LootSystem
```

car il ne modifie rien.

Préférer :

```
LootGenerator
```

ou :

```
LootResolver
```

---

# Exemple Loot

Terrain :

```rust
TerrainDefinition {

    walkable,

    movement_cost,

    loot: Vec<LootEntry>

}
```

LootGenerator :

```rust
generate(
    terrain
)
```

Retour :

```rust
Vec<ResourceStack>
```

Exemple :

```text
Wood x3
Stone x1
```

---

# Inventory

Séparer :

## InventoryState

Etat global :

```rust
pub struct InventoryState {

    player: Inventory

}
```

---

## Inventory

Objet métier :

```rust
pub struct Inventory {

    resources: HashMap<Resource,u32>

}
```

Il contient :

* ajout
* suppression
* vérification capacité

---

# ECS

Le projet est inspiré ECS mais pas un ECS pur.

## Entity

Exemple :

```
Entity 1

Position
Health
InventoryComponent
PlayerComponent
```

---

## Component

Données attachées aux entités.

Exemple :

```rust
Position {
    x,
    y
}
```

---

## State

Etat global :

```text
GameState

├── WorldState
├── EntityState
├── InventoryState
└── TimeState
```

---

# Events

Les events vont dans :

```
game-engine/event
```

Exemple :

```rust
pub enum GameEvent {

    InventoryChanged {
        inventory: InventoryView
    }

}
```

---

# Pourquoi Event plutôt que return ?

Pour une action :

```text
Gather
```

ne retourne pas :

```rust
Result<Inventory>
```

mais :

```text
Gather

↓

InventoryState modifié

↓

InventoryChanged Event

↓

React mis à jour
```

Avantages :

* toutes les actions peuvent modifier l'inventaire
* React n'a pas besoin de connaître les mécaniques
* découplage

---

# Communication Event vers React

## Engine

Produit :

```rust
GameEvent::InventoryChanged
```

---

## Tauri

Transforme :

```rust
app.emit(
    "inventory_changed",
    data
)
```

---

## React

Ecoute :

```typescript
listen(
 "inventory_changed",
 callback
)
```

---

# Initialisation UI

Les events ne remplacent pas totalement les queries.

Au démarrage :

```text
React

invoke("get_initial_state")

↓

GameEngine

↓

Etat initial
```

Puis :

```text
Events

↓

Synchronisation temps réel
```

---

# Architecture finale

```text
                  React

          invoke       listen

             |            ^
             v            |

              Tauri

                |
                v

           GameEngine

                |
        +-------+-------+

        |               |

    Command          Event

        |               ^

        v               |

      System -------- State

        |

        +---- Model

        +---- Definition
```

---

# Principes à conserver

1. **React ne connaît pas le gameplay**
2. **Tauri ne contient aucune règle**
3. **Command = intention**
4. **System = logique métier**
5. **State = vérité actuelle du monde**
6. **Event = fait qui s'est produit**
7. **Model = objets métier réutilisables**
8. **Definition = données statiques**
9. **GameEngine est le seul point d'entrée du moteur**
10. **Le moteur ne dépend jamais de Tauri**

Cette base permet de continuer le développement sans remettre en cause l'architecture plus tard.
