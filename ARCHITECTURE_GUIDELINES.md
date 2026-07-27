# ARCHITECTURE_GUIDELINES.md

> Document de référence officiel du projet **Alchinons**.
> Il ne décrit pas l'existant : il définit comment le projet **doit** être développé à partir de maintenant, par un humain comme par une IA.
>
> **Portée de cette version.** Le projet est composé de trois couches (`engine` en Rust, `src-tauri` en Rust, `src` en React). Cette première version du document couvre exclusivement **`engine`** — le cœur du moteur de jeu — parce que c'est la fondation sur laquelle tout le reste s'appuie, et parce que c'est là que les décisions structurelles coûtent le plus cher à changer une fois prises. Une revue équivalente pour `src-tauri` (le pont Tauri) et `src` (le frontend React) suivra et viendra compléter ce document. Toute règle ci-dessous qui mentionne ces couches ne le fait que pour définir la **frontière** avec `engine`.

---

## 1. Vision du projet

### 1.1 Ce qu'est le moteur

`engine` est un moteur de simulation pour un jeu de survie / artisanat / exploration en tuiles hexagonales. Il reçoit des **commandes**, fait évoluer un **état de jeu**, et produit en retour une **sortie** (réponse directe) et/ou des **événements** (notifications asynchrones). Il ne sait rien de Tauri, de React, ni de la manière dont il est affiché ou invoqué — c'est un principe déjà respecté aujourd'hui (`engine/Cargo.toml` ne dépend d'aucune brique UI) et il doit être considéré comme **non négociable**.

### 1.2 Philosophie générale

- **Le moteur est une bibliothèque, pas une application.** Il doit pouvoir être compilé, testé et exécuté "headless" (sans Tauri, sans frontend) indéfiniment. Le jour où compiler `engine` sans `src-tauri` devient impossible, c'est que la séparation a été violée.
- **Une commande, une transition d'état, un résultat.** Le moteur ne doit jamais avoir besoin d'aller chercher de l'information ailleurs que dans son propre état pour répondre à une commande.
- **Le jeu doit durer des années, pas des semaines.** Chaque raccourci pris aujourd'hui (duplication, couplage, typage faible) est un raccourci que quelqu'un d'autre — humain ou IA — paiera plus tard sans avoir le contexte de pourquoi il a été pris. Ce document existe pour porter ce contexte à sa place.
- **Le compilateur est le premier relecteur.** Chaque fois qu'une règle peut être vérifiée par le système de types plutôt que par une convention ou un commentaire, elle doit l'être (cf. §2.7, §4.6).

### 1.3 Principes fondamentaux

1. Le moteur ne dépend jamais de la couche de présentation.
2. Un module se découpe par **domaine de jeu** (craft, inventaire, déplacement...), pas par **rôle technique** (states, systems, views...).
3. Toute mutation de l'état de jeu passe par un `System` ; toute lecture peut le contourner.
4. L'API publique du crate `engine` est petite, intentionnelle, et documentée — tout le reste est un détail d'implémentation.
5. Aucune dépendance, aucune abstraction, aucun fichier n'existe "au cas où" : tout ce qui est ajouté sert un besoin réel, présent.
6. Un commentaire explique un *pourquoi* non évident ; jamais un *quoi*, que le code dit déjà.

---

## 2. Principes d'architecture

### 2.1 Séparation des responsabilités

Le moteur suit déjà, dans son intention, un flux clair :

```
Command (entrée)  →  System (mutation de l'état)  →  Event (notification) + CommandOutput (réponse)
                            ↑
                        GameState (données)
```

Cette frontière `Command → System → State` doit rester la colonne vertébrale du moteur. Ce qui doit changer, c'est la façon dont le code est **rangé** autour de cette colonne (voir §2.2) et la façon dont elle est **protégée par le compilateur** plutôt que par la convention (voir §2.6, §4.4).

### 2.2 Modularité — organiser par domaine, pas par couche technique

**C'est la recommandation la plus importante de ce document.**

Aujourd'hui, `engine/src` est rangé par *rôle technique* : `commands/`, `states/`, `systems/`, `views/`, `definitions/`, `events/`. Comprendre une seule fonctionnalité — par exemple le craft — oblige à ouvrir cinq dossiers différents :

```
commands/craft.rs     (payload de la commande)
states/craft.rs       (file d'attente des crafts en cours)
systems/craft.rs      (logique d'exécution)
definitions/recipe.rs (recettes disponibles)
views/recipe.rs       (DTO exposé au frontend)
```

...plus une entrée dans l'`enum Command`, une autre dans le `match` de `GameEngine::execute`, et un champ dans `GameState`. Neuf points de contact pour une fonctionnalité. Ça fonctionne à la taille actuelle du projet (quatre fonctionnalités), mais **ce n'est pas un découpage qui survit à la croissance** : chaque nouvelle fonctionnalité (combat, météo, faim, PNJ, quêtes...) ajoute un fichier dans chacun de ces dossiers, qui deviennent des sacs fourre-tout où plus rien n'est trouvable par nom de dossier — seulement par nom de fichier.

**Règle : un module = un domaine de jeu.** La structure cible est *feature-first* (découpage vertical), la structure technique interne à chaque domaine reste libre mais cohérente :

```
engine/src/
├── lib.rs
├── engine.rs              # GameEngine : composition root, seul point d'entrée
├── position.rs            # types transverses partagés par tous les domaines
├── event.rs                # enum Event + trait EngineBroadcast (transverse)
│
├── craft/
│   ├── mod.rs
│   ├── recipe.rs          # définitions (ex definitions/recipe.rs)
│   ├── state.rs           # file d'attente (ex states/craft.rs)
│   ├── system.rs          # logique (ex systems/craft.rs)
│   ├── view.rs             # DTO (ex views/recipe.rs)
│   └── command.rs          # payload + variante de Command
│
├── inventory/
│   ├── mod.rs
│   ├── model.rs            # Inventory (ex definitions/inventory.rs)
│   ├── state.rs            # InventoryState
│   ├── system.rs            # transfert (ex systems/transfert.rs)
│   ├── view.rs
│   └── command.rs
│
├── movement/                # gather + move + pathfinding partagent un même domaine "présence sur la carte"
│   ├── mod.rs
│   ├── system.rs
│   ├── pathfinding.rs       # (ex services/pathfinding.rs)
│   └── command.rs
│
├── world/                    # ex ecs::map + definitions::{map,area,terrain}
│   ├── mod.rs
│   ├── map.rs
│   ├── tile.rs
│   ├── terrain.rs
│   ├── loot.rs               # (ex services/loot.rs)
│   └── view.rs
│
└── player/
    ├── mod.rs
    └── state.rs
```

Un nouveau contributeur (ou une IA) qui doit modifier le craft n'ouvre alors qu'**un seul dossier**. `GameState` reste le point de composition (il assemble un état par domaine), et `GameEngine::execute` reste le point de routage — mais chaque domaine possède et fait évoluer son propre `Command`/`System`/`State`/`View` sans avoir à répartir ses fichiers dans l'arborescence globale.

> Cette réorganisation n'est pas cosmétique : c'est le moment le moins coûteux pour la faire (≈1800 lignes, un seul contributeur). Chaque fonctionnalité ajoutée avant cette réorganisation augmente son coût.

### 2.3 Découplage

- `engine` ne doit **jamais** importer `tauri`, `tauri-plugin-*`, ni aucun crate de rendu. Le seul point de contact avec l'extérieur est `Command` (entrée), `CommandOutput` (sortie), `Event` (notification).
- Un domaine ne doit **jamais** importer directement l'état interne d'un autre domaine. S'il a besoin d'agir sur un autre domaine (ex. le craft qui modifie un inventaire), il passe par l'API publique de ce domaine (`InventoryState::get_by_name_mut`, pas `other_domain::InternalStruct { .. }`).
- La communication entre domaines qui n'ont pas de lien de composition direct (ex. un futur système de météo qui influence la faim) doit passer par des `Event`, jamais par un appel direct d'un système vers l'état d'un autre.

### 2.4 Composition plutôt qu'héritage

Rust n'a pas d'héritage — ce principe se traduit ici par : préférer de petites structures assemblées et des traits pour du comportement interchangeable, plutôt que de simuler une hiérarchie objet.

Le moteur a déjà un bon exemple de ce principe : `services::pathfinding::search<F: Fn(Position, Position) -> u32>` reçoit son heuristique en paramètre générique plutôt que de coder en dur "la" distance, ou de créer une hiérarchie `trait Heuristic` avec des implémentations. **Ce pattern (comportement injecté via générique/closure plutôt que sous-classement) doit être le réflexe par défaut** dès qu'un système a besoin d'un comportement variable.

À l'inverse, évitez de créer un `trait System` avec des implémentations juste pour "faire propre" si rien n'en a besoin aujourd'hui — voir §2.5 sur les abstractions non justifiées.

### 2.5 Une abstraction doit se justifier par un besoin, pas par convention

Les quatre `System` actuels (`GatherSystem`, `MoveSystem`, `TransferInventorySystem`, `CraftSystem`) sont des structures **sans aucun champ** (`Self {}`), qui n'existent que pour porter une méthode `execute`. Aujourd'hui, ce sont des fonctions libres déguisées en objets.

**Règle : une structure ne se justifie que si elle porte un état ou une dépendance.** Deux issues possibles, à trancher explicitement au moment d'ajouter le prochain système plutôt que par copier-coller du pattern existant :

- Si un système n'a et n'aura pas d'état → une fonction libre `pub fn execute(...)` dans le module du domaine suffit, pas de structure.
- Si un système a besoin d'une dépendance injectée (voir §2.6 sur le RNG ci-dessous, un exemple concret et déjà présent dans le code) → la structure se justifie, et elle doit porter cette dépendance dès sa création, pas rester vide "pour l'instant".

### 2.6 Gestion des dépendances (crates ET dépendances internes)

**Règle stricte : aucune dépendance n'est ajoutée avant d'être utilisée.** `engine/Cargo.toml` déclare aujourd'hui `euclid` et `uuid` : aucun des deux n'est référencé une seule fois dans le code (vérifié par recherche exhaustive). Une dépendance non utilisée n'est pas neutre : elle alourdit la compilation, et surtout elle induit en erreur — un lecteur qui voit `euclid` en dépendance suppose à tort qu'il existe déjà de la géométrie vectorielle dans le projet. **Ces deux dépendances doivent être retirées, ou utilisées immédiatement** (par exemple, `euclid` serait légitime pour remplacer le calcul manuel de distance dans `Shape::Circle::contains`, mais tant que ce n'est pas fait, elle n'a rien à faire dans `Cargo.toml`).

Un autre exemple de dépendance implicite mal maîtrisée : `Looting::generate` (services/loot.rs) et `Map::pick_tile` (ecs/map.rs) appellent directement `rand::random()` / `rand::random_range()` — une source d'aléa globale, non injectée, non seedable. Tant que le moteur n'a pas besoin de déterminisme (replays, sauvegardes reproductibles, tests de tirage), ce n'est pas un problème. Le jour où l'un de ces besoins apparaît, la source d'aléa devra être injectée (via le `System` qui, à ce moment-là, gagnera un champ légitime — cf. §2.5) plutôt que patchée en urgence dans un module profond. **Notez ce point maintenant ; ne le résolvez que quand le besoin est réel.**

### 2.7 Stabilité des interfaces publiques

`lib.rs` déclare aujourd'hui **tous** ses modules en `pub` :

```rust
pub mod definitions;
pub mod ecs;
pub mod systems;
pub mod states;
pub mod engine;
pub mod events;
pub mod commands;
pub mod views;
pub mod services;
```

Or l'intention réelle du moteur est que seuls quatre éléments constituent son API : `engine::GameEngine`, `commands::Command`, `commands::outcome::CommandOutput`, `events::Event` (+ `EngineBroadcast`/`EngineCommand`). C'est d'ailleurs tout ce que `src-tauri` importe en pratique. Mais rien dans le code n'empêche un futur consommateur (ou un futur vous, par inadvertance) d'importer `engine::states::GameState` ou `engine::systems::gather::GatherSystem` directement et de court-circuiter `GameEngine::execute` — l'invariant "toute mutation passe par une Command" n'est protégé par rien.

**Règle : l'API publique du crate est ce que `lib.rs` exporte en `pub`, et rien de plus.** Tout module qui n'est pas destiné à être consommé depuis l'extérieur du crate doit être déclaré `pub(crate) mod`, voire rester privé et n'être réexporté qu'au travers du point d'entrée du domaine. Concrètement : `definitions`, `ecs`/`world`, `states`, `systems`, `services`, `views` doivent devenir `pub(crate)` — aucun de leurs types n'est aujourd'hui nommé depuis `src-tauri`, qui ne manipule que `Command`, `CommandOutput` et `Event` de façon opaque. Seuls `commands`, `events`, et `engine` (limité à `GameEngine` + `Command`) restent publics.

Cette règle vaut aussi **à l'intérieur** de chaque domaine une fois la réorganisation du §2.2 faite : un domaine expose son `Command`, son `View`, éventuellement son `Event` — pas son `State` interne ni son `System`.

### 2.8 Organisation des données — un type, un sens

Un type ne doit représenter **qu'une seule notion**. Aujourd'hui, `Position { x: u32, y: u32 }` représente à la fois :

- une case de la grille (utilisée par `Command::Move`, `ecs::player::Player::position`, le pathfinding) ;
- un point en pixels dans le repère local d'une tuile, ancré en haut-gauche, borné à `0..400` (utilisé par `Command::Gather`, `Area::position`, `Shape::contains`).

Ces deux espaces de coordonnées n'ont ni la même échelle, ni la même origine, ni les mêmes bornes — et ne sont distingués aujourd'hui que par des commentaires (`definitions/area.rs`, `commands/mod.rs`). Le frontend confirme que la confusion est réelle : `HexGrid.jsx` convertit une position logique de grille vers un pixel (`toPixel`), tandis que `TileCanvas.jsx` envoie un clic brut en pixels directement dans `Command::Gather`. Rien n'empêche aujourd'hui d'envoyer par erreur une position-pixel là où une position-grille est attendue : ça compile, ça s'exécute, et ça produit un résultat silencieusement faux.

**Règle : quand deux usages d'un même type représentent des unités ou des repères différents, ce sont deux types différents.** Recommandation concrète : introduire `GridPosition` (grille, utilisé par `Move`, `Player`, pathfinding, `Map`) et `LocalPoint` (repère pixel 0..400 d'une tuile, utilisé par `Gather`, `Area`, `Shape`) comme deux `struct` distinctes (éventuellement de même forme interne, mais non interchangeables sans conversion explicite). Le compilateur doit rendre cette confusion impossible, pas seulement un commentaire.

De la même façon, les inventaires sont identifiés par une `String` brute (`"player"`, `"warehouse"`) matchée à la main dans `InventoryState::get_by_name(_mut)`, et cette même chaîne est dupliquée côté frontend (`src/utils/api.js`). Ajouter un troisième inventaire impose de mettre à jour ce match à deux endroits et de ressaisir la bonne chaîne magique partout. **Recommandation : remplacer les noms d'inventaire par un enum `InventoryId` sérialisable**, pour que le compilateur signale un `match` non exhaustif dès qu'un inventaire est ajouté, au lieu de retomber silencieusement sur `None` en cas de faute de frappe.

---

## 3. Organisation des modules

### 3.1 Ce qu'un module de domaine peut contenir

- Ses propres définitions de données (constantes de jeu, structures).
- Son propre état (`State`), possédé et composé par `GameState`.
- Son propre `System` (fonction ou structure, cf. §2.5), seul autorisé à muter son `State`.
- Sa propre `View` (DTO de sortie vers le frontend).
- Le payload de sa/ses variante(s) de `Command`.
- Ses propres tests unitaires (hors périmètre de cette revue, mais ils vivent avec le code qu'ils testent).

### 3.2 Ce qu'un module de domaine ne doit jamais contenir

- Une dépendance directe vers l'état interne d'un autre domaine (voir §2.3).
- Une dépendance vers `tauri`, `serde_json` pour construire une réponse HTTP-like, ou tout ce qui présuppose un canal de transport particulier.
- De la logique dupliquée qui existe déjà ailleurs sous une autre forme. Exemple actuel à surveiller : le commentaire de fin de `definitions/area.rs` signale un doublon entre le loot porté par `TerrainDefinition` et celui porté par `Area` — en l'état actuel du code, `TerrainDefinition` ne porte plus de champ `loot` du tout, donc ce commentaire est **obsolète** et doit être retiré (voir §5.2 : un commentaire qui ne décrit plus la réalité du code est pire qu'une absence de commentaire).

### 3.3 Dépendances autorisées entre couches transverses

Après la réorganisation du §2.2, il ne reste que peu de modules réellement transverses (`position`, `event`, `engine`). Le sens de dépendance autorisé est :

```
position, event      (aucune dépendance interne — types purs)
        ↑
craft/, inventory/, movement/, world/, player/   (dépendent de position/event, jamais entre eux directement)
        ↑
engine.rs             (compose GameState, route les Command, seul à connaître tous les domaines)
```

Un domaine ne remonte jamais vers `engine.rs`, et deux domaines ne se référencent jamais latéralement — seul `engine.rs` a le droit de connaître tout le monde.

### 3.4 Décision à trancher : le module `ecs`

Le module `ecs` (`ecs::player::Player`, `ecs::map::Map`) porte un nom qui promet un pattern *Entity-Component-System* — entités identifiées par ID, composants attachés dynamiquement, systèmes itérant par requête sur des composants. **Ce n'est pas ce qui est implémenté** : ce sont deux structures de données singleton, au même titre que `InventoryState`. Le nom induit en erreur tout contributeur (humain ou IA) qui s'attendrait à pouvoir "spawner une entité" ou "attacher un composant".

Cette question doit être tranchée explicitement, pas laissée dériver :

- **Si le jeu reste single-player, un seul joueur, pas de PNJ ni de multijoueur prévu à moyen terme** → renommer le module (`world` par exemple, cf. arborescence §2.2), retirer le mot "ECS" du vocabulaire du projet (y compris du README), et arrêter de payer le coût conceptuel d'un pattern qui n'est pas utilisé.
- **Si des entités multiples sont dans la feuille de route (PNJ, animaux, multijoueur)** → adopter un vrai ECS (crate existant comme `hecs`, ou un stockage par ID + composants fait main), et migrer `Player` vers ce modèle *avant* d'ajouter la deuxième entité, pas après.

Ne pas trancher cette question revient à perpétuer le nom "ecs" par défaut, ce qui est la pire des deux options : ni le confort d'un vrai ECS, ni la clarté d'un module honnêtement nommé.

---

## 4. Règles de développement

### 4.1 Nommage

- Nom de fichier = nom du concept qu'il porte, au singulier (`recipe.rs`, pas `recipes.rs`), déjà globalement respecté.
- Un enum de domaine (`Resource`, `Recipe`, `Terrain`, `AreaType`) et sa `*Definition` associée (données statiques : `RecipeDefinition`, `TerrainDefinition`) sont deux types distincts et doivent le rester : l'enum est l'identité légère (`Copy`, utilisable comme clé de `HashMap`), la `*Definition` est la donnée lourde associée (`&'static`). Ce pattern déjà en place (`Recipe::definition() -> &'static RecipeDefinition`) est bon et doit être reproduit pour toute nouvelle donnée de jeu statique.
- Un type qui traverse la frontière frontend (présent dans un `View` ou un `Command`) doit avoir un nom qui a du sens côté JSON, pas seulement côté Rust.

### 4.2 Structure des fichiers

- Un fichier = une responsabilité. Au premier signe qu'un fichier de domaine dépasse ~150-200 lignes et mélange plusieurs préoccupations (ex. `definitions/area.rs`, 404 lignes, qui mélange définitions statiques de zones *et* le catalogue complet des tuiles de la carte), le scinder : les définitions de zones (`AreaType`, `AreaTypeDefinition`, `Shape`) d'un côté, le catalogue des tuiles (`PLAIN_TILE_1`, `FOREST_TILE_1`, etc.) de l'autre. Le contenu (les données) grossira avec chaque nouvelle tuile ; le code (la logique) ne doit pas grossir avec lui.
- Les tests, quand ils existent, restent en `#[cfg(test)] mod tests` en bas du fichier qu'ils couvrent (déjà la convention en place dans `pathfinding.rs` et `systems/craft.rs`) — hors périmètre de jugement de cette revue, mais la convention de placement est à conserver.

### 4.3 Responsabilités par type de fichier

| Rôle | Contient | Ne contient jamais |
|---|---|---|
| `*/model.rs`, `*/recipe.rs`... (définitions) | Structures de données, constantes `&'static`, méthodes de lecture pure | Mutation, accès à `GameState`, aléa |
| `*/state.rs` | Les données mutables d'un domaine, propriété exclusive de ce domaine | Logique métier (calculs, règles) |
| `*/system.rs` | La logique qui mute un `State` en réponse à une `Command`, produit des `Event` | Sérialisation JSON, accès à un autre domaine |
| `*/view.rs` | DTO de sortie, conversion explicite `to_view()` depuis le domaine | Toute logique métier |
| `*/command.rs` | Le payload d'entrée (désérialisé depuis le frontend) | Toute logique |

### 4.4 Visibilité (`pub`)

Règle de base : **la visibilité par défaut est la plus restrictive possible**, et on l'élargit seulement quand un besoin réel apparaît — jamais par anticipation.

- `pub` réservé à ce qui traverse la frontière du crate (§2.7) ou la frontière d'un domaine.
- `pub(crate)` pour ce qui est partagé entre domaines à l'intérieur du crate (aujourd'hui trop généreusement utilisé pour des champs qui devraient être privés — ex. `InventoryState::player`/`warehouse` n'ont aucune raison d'être `pub(crate)` puisque `get_by_name`/`get_by_name_mut` existent déjà pour y accéder ; le champ direct doit devenir privé).
- Privé (rien) par défaut pour tout champ de `State` : l'accès passe par des méthodes du domaine, jamais par le champ. Ça garantit que "toute mutation passe par un System" (principe §2.1) n'est pas qu'une convention mais une propriété vérifiée par le compilateur.
- Incohérence actuelle à corriger : `states::craft::PendingCraft` a des champs `pub`, alors que le reste du code utilise `pub(crate)` pour des données équivalentes — uniformiser vers le niveau le plus restrictif possible.

### 4.5 Gestion des erreurs

Le moteur mélange aujourd'hui trois stratégies sans règle explicite : `Option` (`get_by_name`), un enum de résultat maison (`Inventory::excludes` — voir la mise en garde ci-dessous), et `unwrap()`/`expect()` direct.

**Règle :**

- **`Result`/`Option`** pour tout ce qui peut légitimement échouer en fonctionnement normal (inventaire introuvable, chemin bloqué, ressources insuffisantes) — c'est déjà majoritairement le cas et doit rester la norme.
- **`panic!`/`unwrap()`** réservé aux invariants internes vraiment impossibles à violer, et **jamais atteignable depuis le traitement d'une `Command`** venant du frontend. Aujourd'hui, `state.engine.lock().unwrap()` (dans `src-tauri/src/commands.rs` et `lib.rs`) est exactement le cas à éviter : si un seul `panic!` se produit n'importe où pendant l'exécution d'une commande (par exemple un futur `unwrap()` mal placé dans un système), le `Mutex` est empoisonné et **toute commande suivante panique à son tour, pour le reste de la session** — un bug local devient un plantage permanent de l'application. Avant d'ajouter un scheduler ou une boucle de tick (cf. §4.7), ce point doit être traité : soit récupérer le poisoning explicitement, soit garantir par construction qu'aucun `panic!` ne peut se produire pendant l'exécution d'un `System`.
- **Un type de résultat doit se lire sans ambiguïté.** `Inventory::excludes` retourne `None` quand le retrait a **entièrement réussi**, et `Some(partiel)` quand il y a eu débordement — l'inverse de ce qu'on lit intuitivement dans un `Option` (`None` = rien de notable, `Some` = cas particulier à gérer). Cette inversion sémantique a une conséquence réelle : `TransferInventorySystem::execute` (systems/transfert.rs) traite le cas `None` (transfert complet, le cas courant) en appelant `destination_inventory.excludes(...)` au lieu de `add_multi(...)` — **les ressources sont retirées de la destination au lieu d'y être ajoutées**. Un transfert complet fait donc disparaître les ressources au lieu de les déplacer. C'est un bug réel, présent dans le code actuel, non détecté faute de test sur ce module. Il illustre exactement pourquoi ce document interdit les `Option`/`Result` dont le sens n'est pas évident à la lecture de l'appel : préférer un type explicite (`enum ExclusionOutcome { Full, Partial(HashMap<Resource, u32>) }`) à un `Option` dont la signification s'apprend seulement en lisant le corps de la fonction.

### 4.6 `enum`, `struct`, `trait`, `impl`

- `enum` pour toute donnée fermée (ensemble fini et connu de variantes) : `Resource`, `Terrain`, `AreaType`, `Recipe` — bon usage déjà en place.
- `struct` pour toute donnée ouverte / composée. Une `struct` sans aucun champ (`GatherSystem {}`) est un signal à interroger, pas un pattern à reproduire (§2.5).
- `trait` réservé à un comportement réellement interchangeable (plusieurs implémentations attendues) ou à un contrat de frontière (comme `EngineCommand`/`EngineBroadcast`, qui documentent un contrat de nommage partagé avec le frontend — bon usage à conserver et à répliquer, par exemple pour les noms d'inventaire, cf. §2.8). Un trait avec une seule implémentation et aucune perspective d'une deuxième n'est pas une abstraction, c'est de l'indirection gratuite.
- La sérialisation d'un `enum` exposé au frontend doit suivre **une seule convention dans tout le projet**, jamais décidée au cas par cas. Aujourd'hui, `Resource`/`Recipe` traversent la frontière via `#[derive(Serialize, Deserialize)]` directement, alors que `Terrain`/`AreaType` sont convertis à la main via `format!("{:?}", x).to_lowercase()` avant d'être placés dans une `String` de la vue. Cette seconde approche est fragile (elle dépend du format exact produit par `#[derive(Debug)]`, qui casse silencieusement si une variante gagne un jour des champs) et doit être remplacée par le pattern déjà correctement utilisé sur `ShapeView` : `#[derive(Serialize)] #[serde(rename_all = "lowercase")]` directement sur l'enum.

### 4.7 Décision à trancher : le modèle d'exécution (tick / boucle de jeu)

`CraftState::tick` et `CraftSystem::tick` sont entièrement implémentés et testés, mais **rien ne les appelle** — `engine.rs` contient deux commentaires (`//fn tick()`, `//fn scheduler()`) qui montrent que la question est identifiée mais non tranchée. Aujourd'hui, le moteur est purement réactif : une `Command` entre, une transition d'état sort, rien ne se passe en l'absence de commande — alors même que des données à durée (`duration`, `remaining_ticks`) existent déjà dans le domaine du craft.

Cette ambiguïté doit être résolue **avant** la prochaine fonctionnalité qui dépend du temps (faim, météo, cuisson longue...), pas pendant. Deux options légitimes, à choisir consciemment et à documenter ici une fois choisie :

1. **Boucle de jeu autonome** : une tâche de fond appelle `tick()` sur chaque domaine à intervalle fixe, indépendamment des commandes du joueur. Nécessaire si le monde doit évoluer même quand le joueur ne fait rien (faim qui progresse, météo qui change). Complexifie la gestion de la concurrence (le `Mutex` déjà présent devient un point de contention régulier, pas seulement au moment des commandes).
2. **Calcul paresseux basé sur un horodatage/compteur de tick** : au lieu d'un `remaining_ticks` décrémenté par un scheduler, stocker le tick (ou l'instant) de complétion au moment de la planification, et ne calculer "est-ce terminé" qu'à la prochaine commande ou requête qui s'y intéresse. Plus simple, pas de tâche de fond, mais ne convient pas à un mécanisme qui doit progresser même sans interaction du joueur.

Tant que ce choix n'est pas fait, n'ajoutez pas de deuxième mécanisme à durée sur le modèle de `CraftState` — cela ne ferait que dupliquer une décision d'architecture non prise.

---

## 5. Documentation

### 5.1 Docstrings — obligatoires

Une docstring (`///`) est obligatoire pour :

- Toute fonction, structure, enum ou trait `pub` (et, après la restriction de visibilité du §2.7, tout `pub(crate)` partagé entre domaines).
- Toute logique métier non triviale (calcul de loot, A*, résolution de craft différé).

Elle doit expliquer le rôle, les paramètres, la valeur de retour, les invariants, et les effets de bord — pas reformuler la signature. Exemple déjà présent et correct dans le code (`services/pathfinding.rs`) :

```rust
/// Distance hexagonale entre deux positions sur une grille odd-q offset.
/// Utilise les coordonnées cubiques pour un résultat exact et symétrique.
pub fn hex_distance(a: Position, b: Position) -> u32 { ... }
```

Ce style (rôle + méthode + garantie) est le niveau attendu pour toute nouvelle fonction publique.

### 5.2 Commentaires — jamais le "quoi", toujours le "pourquoi"

Un commentaire est interdit s'il ne fait que reformuler ce que le code dit déjà (`// on ajoute la ressource à l'inventaire` au-dessus de `inventory.add(...)` n'a aucune valeur). Un commentaire est obligatoire quand une information *ne peut pas* se déduire de la lecture du code :

- **Une règle métier ou un invariant caché.** Bon exemple déjà présent (`commands/mod.rs`) :
  > `/// position` est le point cliqué dans le repère local de la tile (0..400, ancrage haut-gauche) — pas une case de la grille, contrairement à `Move`.`
  C'est exactement le genre d'information qu'aucun nom de champ ne peut porter seul — et c'est aussi la preuve vivante qu'un commentaire ne remplace pas un type (§2.8) : ce commentaire existe *parce que* `Position` porte deux sens à la fois. Une fois `GridPosition`/`LocalPoint` séparés, ce commentaire devient inutile — c'est le signe qu'il documentait un problème de conception, pas une subtilité légitime.
- **Une décision d'architecture ou un contournement technique.** Bon exemple déjà présent (`definitions/recipe.rs`) expliquant pourquoi `duration` peut valoir zéro ou non, et ce que ça implique pour le système qui la consomme.
- **Une limitation connue ou une dette assumée.** À condition de rester vraie : voir §3.2, le TODO obsolète de `definitions/area.rs` qui décrit un doublon qui n'existe plus doit être retiré, pas laissé — un commentaire faux est plus dangereux qu'aucun commentaire, humain comme IA le prendront pour argent comptant.
- **Un marqueur de contrat de frontière.** Le commentaire au-dessus de `trait EngineCommand` (`commands/mod.rs`) expliquant pourquoi cette constante existe alors qu'elle n'est consommée par aucune macro est un excellent exemple à reproduire chaque fois qu'une chaîne magique doit rester synchronisée entre Rust et le frontend sans que le compilateur puisse le garantir seul.

---

## 6. Pérennité

Ce document doit rester la référence unique : toute nouvelle fonctionnalité, tout refactor, toute revue de code doit s'y référer et, si une règle s'avère fausse ou datée, **ce document doit être corrigé au même titre que le code** — un guide qui ment est aussi dangereux qu'un commentaire qui ment (§5.2).

Priorité d'application recommandée, du plus structurant au plus local :

1. Restreindre la visibilité de `lib.rs` (§2.7) — coût faible, bénéfice immédiat, aucune régression fonctionnelle possible (le compilateur signale tout usage externe cassé).
2. Trancher le sort du module `ecs` (§3.4).
3. Réorganiser `engine/src` par domaine (§2.2) — le plus gros chantier, mais le moins cher à faire maintenant qu'il ne le sera jamais.
4. Séparer `GridPosition`/`LocalPoint` (§2.8).
5. Corriger le bug de `TransferInventorySystem` (§4.5) et clarifier le contrat de retour de `Inventory::excludes`.
6. Nettoyer le code mort identifié (`Event::name`/`Event::payload` inutilisés, `events::inventory::InventoryChanged` vide, dépendances `euclid`/`uuid` inutilisées, imports non utilisés signalés par `cargo check`) et le TODO obsolète de `definitions/area.rs`.
7. Trancher le modèle d'exécution tick/scheduler (§4.7) avant la prochaine fonctionnalité à durée.

### Annexe — constats concrets relevés lors de cette revue (état au moment de la rédaction)

Cette liste n'est pas une todo-list figée : elle documente ce qui a été identifié pour que personne (humain ou IA) n'ait à le redécouvrir, et pour que chaque élément soit retiré de cette annexe au fur et à mesure qu'il est traité.

- **Bug** — `systems/transfert.rs` : `TransferInventorySystem::execute` inverse le cas "transfert complet" et le cas "débordement" à cause du sens contre-intuitif du retour de `Inventory::excludes` (voir §4.5). Un transfert complet fait disparaître les ressources au lieu de les déplacer vers la destination.
- **Code mort** — `events/mod.rs` : `Event::name()` et `Event::payload()` ne sont appelés nulle part (le canal Tauri sérialise l'`enum` directement via `#[derive(Serialize)]`).
- **Code mort** — `events/inventory.rs` : `InventoryChanged {}` est une structure vide, jamais utilisée.
- **Dépendances inutilisées** — `engine/Cargo.toml` : `euclid` et `uuid` ne sont référencés nulle part dans le code.
- **Commentaire obsolète** — fin de `definitions/area.rs` : décrit un doublon de loot entre `Terrain` et `Area` qui n'existe plus (`TerrainDefinition` ne porte plus de champ `loot`).
- **Avertissements du compilateur non traités** — import `std::cmp` inutilisé (`definitions/inventory.rs`), imports `Inventory`/`InventoryView`/`ItemView` inutilisés (`systems/transfert.rs`), champ `PathNode::h` jamais lu après écriture (`services/pathfinding.rs`). Aucun de ces avertissements n'est bloquant individuellement, mais leur accumulation signale qu'ils ne sont pas surveillés.
- **Fonctionnalité à moitié câblée** — `CraftState::tick`/`CraftSystem::tick` sont implémentés et testés mais jamais appelés (voir §4.7).
