# TODO.md — engine

> Liste d'objectifs de refactor établie d'après la structure réelle du code (`engine/src`),
> en écho à `ARCHITECTURE_GUIDELINES.md` (§2.7, §4.3-4.7 et son annexe) et au graphe
> `graphify-out/graph.json`. Vérifié le 2026-08-08 via `cargo build`, `cargo test -p engine`
> et lecture directe du code — chaque point ci-dessous est confirmé présent dans le code
> à cette date, pas seulement supposé depuis la doc.
>
> Quand un point est traité, le retirer aussi de l'annexe correspondante
> d'`ARCHITECTURE_GUIDELINES.md` si applicable (§6 : "un guide qui ment est aussi
> dangereux qu'un commentaire qui ment").

---

## 🔴 Bugs — priorité immédiate (corruption de données / tests rouges)

- [ ] **Collision de fichier de sauvegarde `world` ↔ `progression`.**
  `world/persistence.rs:20` et `world/persistence.rs:36` construisent le chemin de
  sauvegarde de la carte avec `PROGRESSION_SAVE_NAME` (importé de
  `progression::persistence`) au lieu de la constante locale `WOLD_SAVE_NAME` (elle-même
  mal orthographiée, cf. point suivant). Résultat concret : `world::persistence::save`
  et `progression::persistence::save` écrivent **le même fichier** `progression.json`
  dans le dossier de sauvegarde (`engine.rs:114` et `engine.rs:149` appellent les deux
  avec le même `save_path`) — chaque sauvegarde de la carte écrase la progression du
  joueur, et vice-versa. `saver::reset` pour le monde (`engine.rs:140`) cible lui
  correctement `WOLD_SAVE_NAME` (donc `world.json`, un fichier qui n'est en réalité
  jamais créé) : le reset du monde ne nettoie pas le fichier réellement utilisé. C'est
  très probablement le bug visé par le commit `2c2b03e` ("gestion de progession a
  revoir"). Fix : remplacer les deux occurrences de `PROGRESSION_SAVE_NAME` par
  `WOLD_SAVE_NAME` dans `world/persistence.rs`.

- [ ] **Typo `WOLD_SAVE_NAME` → `WORLD_SAVE_NAME`** (`world/persistence.rs:9`). Renommer
  en même temps que le fix ci-dessus (un seul point d'import à mettre à jour,
  `engine.rs:21`).

- [ ] **`TransferInventorySystem::execute` inverse le cas "transfert complet" et le cas
  "débordement"** (`inventory/system.rs:26-30`), documenté en détail en
  `ARCHITECTURE_GUIDELINES.md` §4.5 et annexe. `Inventory::excludes` retourne `None`
  quand le retrait a **entièrement réussi** ; le code actuel traite ce `None` en
  appelant `destination_inventory.excludes(...)` (retire) au lieu de `add_multi(...)`
  (ajoute). Un transfert complet fait donc disparaître les ressources au lieu de les
  déplacer vers la destination. Toujours présent, non testé (pas de test sur ce module).
  Fix recommandé par le doc : remplacer l'`Option<HashMap<..>>` ambigu par un type
  explicite (`enum ExclusionOutcome { Full, Partial(HashMap<Resource, u32>) }`).

- [ ] **Test rouge : `craft::system::tests::deferred_recipe_resolves_after_enough_ticks`**
  — panique `attempt to subtract with overflow` (`craft/system.rs:91`) car
  `Recipe::Charcoal.definition().duration` vaut `0` et le test calcule `duration - 1`
  sur un `u32`. Préexistant (documenté dans l'annexe depuis le 2026-07-28), toujours en
  échec aujourd'hui.

- [ ] **Test rouge : `progression::persistence::tests::save_then_load_roundtrips_state`**
  — panique `IsADirectory` sur `fs::remove_file(&path)` (`progression/persistence.rs:60`).
  Cause : `temp_path()` (ligne 46) construit un chemin qui *ressemble* à un fichier
  (suffixe `.json`) mais l'API `save`/`load` traite en réalité `path` comme un
  **dossier** de sauvegarde et y crée `progression.json` dedans (via
  `saver::save`/`fs::create_dir_all(parent)`) — donc `path` devient un répertoire, que
  `remove_file` ne peut pas supprimer. Une fois le bug de collision ci-dessus corrigé,
  ce test doit aussi être corrigé : nettoyer avec `fs::remove_dir_all(&path)` (ou
  renommer `temp_path()` pour ne plus suggérer un nom de fichier, cf. `player/`, qui n'a
  pas ce problème car il n'a pas encore de tests).

---

## 🟠 Visibilité / surface d'API (`ARCHITECTURE_GUIDELINES.md` §2.7 et §4.4 — pas encore appliqué)

- [ ] `lib.rs` déclare encore **tous** ses modules en `pub`. Restreindre à `pub(crate)`
  tout ce qui n'est pas `commands`, `events`, `engine::GameEngine` — y compris les deux
  modules ajoutés depuis la rédaction du document (`progression`, `saver`), qui ne sont
  pas encore mentionnés dans l'arborescence de §2.2.
- [ ] `InventoryState::player`/`warehouse` : passer en champ privé, l'accès existe déjà
  via `get_by_name(_mut)` (§4.4).
- [ ] `craft::state::PendingCraft` : champs encore `pub`, à uniformiser vers
  `pub(crate)` comme le reste du code (§4.4).

---

## 🟡 Code mort / dépendances inutilisées

- [ ] `Cargo.toml` : `euclid` toujours inutilisé (vérifié par recherche exhaustive) — à
  retirer, ou à utiliser immédiatement (§2.6 suggère `Shape::Circle::contains`). `uuid`
  en revanche est désormais utilisé (`progression/persistence.rs:47`, tests) : à garder,
  contrairement à ce que disait l'annexe d'origine — **ce point de l'annexe est
  maintenant partiellement obsolète, à corriger dans `ARCHITECTURE_GUIDELINES.md`**.
- [ ] `events::inventory::InventoryChanged` (`events/inventory.rs`) : struct vide,
  toujours jamais utilisée — confirmé aussi par le graphe (`graphify query`), qui la
  signale comme nœud isolé (≤1 connexion) dans `GRAPH_REPORT.md`.
- [ ] `events::Event::name()`/`payload()` (`events/mod.rs:31,43`) : toujours jamais
  appelés, le canal Tauri sérialise l'enum directement.
- [ ] `world/tile.rs:188` : `Tile::find` jamais utilisé (nouveau, non présent dans
  l'annexe d'origine).
- [ ] `movement/utils/pathfinding.rs:21` : champ `PathNode::h` jamais lu après écriture
  (préexistant, déjà noté comme seul warning restant au 2026-07-28).
- [ ] Imports inutilisés à nettoyer : `world/tile.rs` (`ResourceNode`),
  `world/persistence.rs` (`ProgressionState`, `Unlockable` — probablement des restes du
  copier-coller à l'origine du bug de collision ci-dessus), `progression/persistence.rs`
  (`std::fs`, `Path` — utilisés seulement sous `#[cfg(test)]`, donc signalés en build
  normal).

---

## 🟢 Décisions d'architecture en attente

- [ ] **§4.7 — modèle d'exécution (tick/scheduler) toujours non tranché.**
  `CraftState::tick`/`CraftSystem::tick` sont implémentés et testés mais rien ne les
  appelle ; `engine.rs:168-170` ne contient toujours que les deux commentaires
  `//fn tick()` / `//fn scheduler()`. À trancher avant toute nouvelle fonctionnalité à
  durée — d'autant plus pertinent maintenant que `progression` (paliers, déblocages)
  s'étoffe.
- [ ] **§2.8 — `Position` à double sens** (case de grille vs point pixel local
  0..400) toujours non séparé en deux types (`GridPosition`/`LocalPoint`).
- [ ] **§2.8 — noms d'inventaire en `String` brute** (`"player"`, `"warehouse"`),
  dupliqués côté frontend : toujours pas remplacés par un enum `InventoryId`.
- [ ] **Nouveau : le rôle "persistence" n'est pas couvert par le modèle CMSSV (§4.3).**
  `player/persistence.rs`, `progression/persistence.rs` et `world/persistence.rs`
  suivent tous le même patron (`load`/`save` via `saver::{load,save}`) mais ce rôle
  n'apparaît pas dans le tableau des cinq rôles. À formaliser (6e rôle, ou variante de
  State) — et documenter `saver.rs` comme module transverse au même titre que
  `position`/`resource`/`events` (§3.3), puisque les trois domaines de persistance en
  dépendent tous sans qu'aucun domaine ne dépende d'un autre.
- [ ] **Mettre à jour l'arborescence de §2.2** pour y intégrer `progression/` et
  `saver.rs`, ajoutés après la rédaction du document (absents de la liste actuelle).

---

## Sources

- `ARCHITECTURE_GUIDELINES.md` (§2.6, §2.7, §2.8, §4.3-4.7, annexe) — définit le
  patron cible, sert de référence pour la priorisation.
- `cargo build` / `cargo test -p engine` (2026-08-08) — warnings et tests rouges
  reproduits en l'état.
- `graphify-out/graph.json` / `GRAPH_REPORT.md` — nœud isolé `InventoryChanged`,
  communautés à faible cohésion (Position & Hex Geometry, Command Output & Events,
  Progression Persistence) à garder à l'œil si elles doivent être scindées plus tard.
