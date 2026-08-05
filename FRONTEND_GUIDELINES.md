# FRONTEND_GUIDELINES.md

> Document de référence officiel du projet **Alchinons**.
> Il ne décrit pas l'existant : il définit comment le Front-End **doit** être développé à partir de maintenant, par un humain comme par une IA.
>
> **Portée de cette version.** Ce document couvre exclusivement `src` (React 19 + Vite + Tailwind v4 + framer-motion), la couche de présentation. Il complète [`ARCHITECTURE_GUIDELINES.md`](./ARCHITECTURE_GUIDELINES.md), qui couvre `engine` (le moteur Rust) — les deux documents forment une paire cohérente et se référencent mutuellement. `src-tauri` (le pont Tauri) n'est traité ici que pour définir la frontière : le frontend ne lui parle qu'au travers de `src/api/` (§3.4).
>
> Comme pour `ARCHITECTURE_GUIDELINES.md`, les tests sont hors périmètre de ce document.

---

## 1. Vision du projet

### 1.1 Ce qu'est le Front-End

Le Front-End est une **couche de présentation**, jamais une source de vérité. Il affiche l'état du jeu, capte l'intention du joueur, et la transmet au moteur — il ne décide jamais lui-même d'une règle de jeu. Le pathfinding, la résolution de loot, les recettes de craft, les règles de déplacement : tout ça vit dans `engine`, jamais dans `src`. Un fichier `src/utils/pathfinding.js` qui réimplémentait un A* a existé dans le repo sans jamais être utilisé (supprimé le 2026-07-28, §6 annexe) — c'était le symptôme exact de ce que ce principe interdit : le jour où quelqu'un l'aurait branché "parce qu'il était déjà là", le front et le moteur auraient eu deux implémentations divergentes de la même règle de jeu.

### 1.2 Philosophie générale

- **Un composant ne sait que ce qu'on lui donne.** Il ne va pas chercher son contexte : il le reçoit en props, ou le lit depuis un provider explicitement nommé. Un composant qui devine son environnement (sa taille, sa position, son rôle métier) ne peut pas être déplacé ailleurs sans casser.
- **Le compilateur ne nous protège pas ici.** Ce projet est en JavaScript, pas en TypeScript : contrairement à `engine` (Rust), aucune erreur de forme de props, de contrat d'API ou de nom de champ n'est détectée avant l'exécution. La vigilance sur les contrats repose donc sur la convention, la JSDoc (§5) et la discipline de revue — pas sur le compilateur. C'est une différence assumée avec `ARCHITECTURE_GUIDELINES.md` §1.3.4, à garder à l'esprit à chaque règle de ce document qui, côté moteur, serait garantie par le type-checker.
- **Le jeu doit durer des années, pas des semaines.** Même principe que le moteur (`ARCHITECTURE_GUIDELINES.md` §1.2) : un composant trop spécialisé aujourd'hui est un composant qu'il faudra dupliquer, puis désynchroniser, demain. Ce document existe pour que la généricité soit un choix fait maintenant, pas un refactor fait plus tard sous pression.
- **Le style et l'animation sont des systèmes, pas des détails locaux.** Une classe Tailwind ou un spring framer-motion écrit à la main dans un composant n'est pas un problème en soi — le problème commence quand le même effet est réécrit une deuxième fois avec des valeurs légèrement différentes. Ce cas s'était déjà produit trois fois pour l'effet "pop" d'un bouton (`Button.jsx`, `ButtonHold.jsx`, `ButtonDumper.jsx`, trois springs distincts sans justification) avant d'être unifié en un seul `SPRING_POP` (§4.6).

### 1.3 Principes fondamentaux

1. Le Front-End ne dépend jamais d'une règle de jeu : il l'interroge et l'affiche.
2. Un composant se classe par **nature** (générique/`ui`, ou lié à un domaine de jeu) avant de se classer par domaine — voir §2.2.
3. Un seul point d'entrée vers le moteur (`src/api/`) ; tout composant qui appelle `invoke`/`listen` directement contourne cette frontière.
4. Aucune dépendance npm, aucun fichier, aucune abstraction n'existe "au cas où" : tout ce qui est ajouté sert un besoin réel et présent (voir §2.5 pour les cas déjà tranchés : pas de state manager, pas de `clsx`, pas de tokens de couleur sémantiques, pas de presets d'animation pour des composants qui n'existent pas encore).
5. Un commentaire ou une JSDoc explique un *pourquoi* non évident ; jamais un *quoi* que le code dit déjà.
6. Le critère de refactorisation est le **mélange de préoccupations**, jamais la seule longueur d'un fichier — voir §4.9.

---

## 2. Principes d'architecture

### 2.1 Séparation des responsabilités

Le flux de données du frontend est déjà globalement sain et doit être préservé :

```
api/ (I/O Tauri)  →  providers/ (Context + state)  →  hooks/ (logique sans Context)  →  composants  →  pages (orchestration)
```

- `src/api/` (ex `src/utils/api.js`, §3.4) est l'unique porte de sortie vers le moteur : `invoke`/`listen` de `@tauri-apps/api` n'apparaissent nulle part ailleurs dans `src`.
- Les `providers/` détiennent l'état partagé entre plusieurs pages (position du joueur, carte, inventaires) et exposent un hook public.
- Les composants de domaine orchestrent des primitives `ui/` et lisent les providers/hooks — ils ne connaissent jamais directement `api/`.
- Les `pages/` composent des composants de domaine pour une route donnée ; elles n'implémentent pas de logique métier propre.

**Règle : dès qu'un appel à `api/` s'accompagne d'état local, d'annulation, ou d'un abonnement à des events, il passe par un provider ou un hook dédié — jamais directement dans un composant sous `components/` ou `pages/`.** C'est cette combinaison (pas le simple fait d'importer `api/`) qui signale un mélange de préoccupations. `TableScroll.jsx` et `TileCanvas.jsx` en étaient l'exemple : ils mélangeaient DnD/rendu avec de l'état (`craftError`, `tile`), de l'annulation, et une écoute d'events directement dans le composant ; ils passent désormais par les hooks dédiés `useCraft()` et `useTile(position)` (§3.4, résolu le 2026-07-28). À l'inverse, un appel de commande "fire-and-forget" sans état ni abonnement associé — comme `gather` passé directement en `onClick` dans `Home.jsx`/`Exploitation.jsx` — n'a rien à gagner à être enveloppé dans un hook : il n'y a pas de préoccupation à séparer. `Craft.jsx` (`getRecipes()` + état local `recipes` dans un simple `useEffect`) est un cas limite du même genre que `useTile` avant son extraction — non extrait pour l'instant faute d'un deuxième besoin similaire (§2.5) ; à revisiter en `useRecipes()` si un second consommateur apparaît. Cette règle ne peut être vérifiée que par convention, pas par le compilateur (§1.2) : la question à se poser à chaque nouveau composant est "est-ce qu'il y a un état/une annulation/un abonnement à gérer ?", pas "est-ce que ce composant importe `api/` ?".

### 2.2 Modularité — une nature avant un domaine

`src/components/` mélangeait deux natures de composants sans les distinguer dans l'arborescence :

- des **primitives génériques** sans connaissance du jeu (`Button/`, `dnd/Dragger.jsx`, `dnd/DropZone.jsx`, `dnd/Slot.jsx`) ;
- des **composants de domaine** qui composent ces primitives pour un système de jeu précis (`craft/`, `map/`, `terrain/`, `navigation/`).

Cette distinction existait déjà dans les faits (`Slot.jsx` est réutilisé tel quel par `Inventory` et `ScrollCraft`) mais rien dans l'arborescence ne la rendait visible ni ne la faisait respecter. **Règle : `components/ui/` regroupe tout composant qui ne dépend d'aucun Context et d'aucun appel moteur ; tout le reste est rangé par domaine de jeu**, à l'image du découpage déjà validé côté moteur (`ARCHITECTURE_GUIDELINES.md` §2.2). **Cette séparation a été appliquée (2026-07-28)** — c'est désormais l'arborescence réelle du dossier `src/` :

```
src/
├── main.jsx, index.css, App.jsx        # App.jsx ne monte plus que <AppProviders> (§3.4)
├── pages/                               # orchestration route-level uniquement
│   ├── Home.jsx, Craft.jsx, Carte.jsx, Exploitation.jsx, Settings.jsx, Oven.jsx, NotFound.jsx
│
├── components/
│   ├── ui/                              # primitives génériques : zéro Context, zéro appel moteur
│   │   ├── Button/
│   │   │   ├── Button.jsx               # façade (variant="classic|hold|dumper")
│   │   │   ├── ButtonHold.jsx
│   │   │   ├── ButtonDumper.jsx
│   │   │   └── styles.js                # base de classes partagée entre les 3 variantes (§4.7)
│   │   ├── dnd/
│   │   │   ├── Dragger.jsx              # exporte `DragEntity`
│   │   │   ├── DropZone.jsx
│   │   │   └── Slot.jsx
│   │   ├── NavBar.jsx                   # remplace la duplication MainLayout/CampLayout (§6)
│   │   ├── SectionHeader.jsx            # remplace les en-têtes dupliqués (§4.7)
│   │   ├── Panel.jsx                    # remplace la "carte sombre" dupliquée (§4.7)
│   │   └── classNames.js                # helper cx() (§2.6, §4.7)
│   │
│   ├── craft/                           # TableScroll, ScrollCraft
│   ├── map/                              # HexGrid, HexTile, PlayerToken, MapLegend
│   ├── terrain/                          # Plain, TileCanvas
│   └── navigation/                       # MainLayout, CampLayout
│
├── providers/                            # Context + hook public co-localisés (state-bridge)
│   ├── AppProviders.jsx                  # compose Map>Player>Inventory, ordre documenté (§3.4)
│   ├── InventoryProvider.jsx
│   └── map/{MapProvider,PlayerProvider}.jsx
│
├── hooks/                                 # logique réutilisable SANS Context propre (§3.4)
│   ├── useHoldProgress.js                 # extrait de ButtonHold.jsx
│   ├── useMergedRefs.js                   # extrait de ButtonDumper.jsx + DropZone.jsx
│   ├── useIsCamp.js                       # extrait de MainLayout.jsx + CampLayout.jsx
│   ├── useTile.js                         # extrait de TileCanvas.jsx
│   └── useCraft.js                        # extrait de TableScroll.jsx
│
├── animations/                             # remplace utils/animation.js (§3.4, §4.6)
│   ├── springs.js, shake.js, gradients.js, presets.js
│
├── api/
│   └── engine.js                           # ex utils/api.js (§3.4)
│
├── config/
│   ├── mapConfig.js
│   └── resources.js                        # RESOURCE_ICONS unifié (§6)
│
└── utils/                                   # UNIQUEMENT des algorithmes purs, sans effet de bord (§3.4)
    ├── hexagone.js, matrix.js, vector.js
    └── easing.js                            # easeOutCubic, extrait de l'ex animation.js
```

Un nouveau contributeur qui doit ajouter un bouton générique n'a plus à se demander "est-ce que ça va dans `craft/` parce que c'est là que je l'utilise d'abord" — la question est tranchée par une règle unique (§2.7 : zéro Context, zéro appel moteur → `ui/`), pas par l'endroit du premier usage.

### 2.3 Découplage

- Un composant sous `components/ui/` ne doit **jamais** importer `@tauri-apps/api`, un provider, ou `src/api/`. C'est la propriété qui permet de le déplacer dans n'importe quelle page sans embarquer une dépendance cachée.
- Un composant de domaine ne doit **jamais** importer l'état interne d'un autre domaine directement (ex. `craft/` ne doit jamais lire `providers/InventoryProvider` pour calculer lui-même un solde — il reçoit l'inventaire en props, déjà résolu par la page ou un hook).
- La communication entre deux domaines qui n'ont pas de lien de composition directe passe par le moteur (un `Event`), jamais par un import croisé entre deux dossiers de `components/`.

### 2.4 Composition plutôt que sur-spécialisation

Un point d'extension (`children`, une prop de configuration, une API de composition) doit répondre à un **besoin réel déjà observé**, pas à un principe général de "toujours composer". Exemple déjà présent dans le code : `components/ui/dnd/Dragger.jsx` (`DragEntity`) et `DropZone.jsx` acceptent `children` librement — c'est justifié, ce sont des conteneurs génériques dont le contenu est par nature arbitraire (n'importe quel élément draggable/déposable). À l'inverse, un composant qui n'a qu'un seul appelant légitime et aucun second besoin identifié n'a pas à exposer d'API de composition "au cas où" : forcer un point d'extension sans consommateur réel est une abstraction sans besoin, exactement ce que §2.5 met en garde.

**Règle de positionnement : le placement d'un composant dans la mise en page de son parent est toujours la responsabilité de l'appelant, via `className` passé en props** — sauf pour les composants dont la fonction même EST le positionnement (`DropZone`, qui a vocation à être une zone de dépôt positionnée par son appelant, ce qu'il fait déjà correctement en acceptant et fusionnant `className`). Aucun composant `ui/` ne code en dur un `absolute inset-0` (ou équivalent) sans le faire dépendre d'un `className` fusionné — c'était la dette qu'avait `components/craft/RockRune.jsx` (un bloc d'animation de craft, retiré du projet le 2026-07-28 faute d'avoir jamais été branché à `TableScroll` — §6 annexe) avant sa suppression ; la règle reste valable pour tout composant futur du même genre.

### 2.5 Une abstraction doit se justifier par un besoin, pas par anticipation

Plusieurs décisions de ce document sont volontairement conservatrices, pour la même raison que `ARCHITECTURE_GUIDELINES.md` §2.5 (les quatre `System` vides du moteur) : ne pas construire une généralité avant qu'un deuxième cas d'usage la justifie.

- **Pas de nouvelle librairie de state management.** Le Context React natif (3 providers aujourd'hui) suffit à l'échelle actuelle. Déclencheur explicite pour revisiter ce choix : le jour où un état doit être partagé entre plus de 4-5 providers avec des dépendances croisées complexes — pas avant.
- **Pas de couche de tokens sémantiques de couleur** (`--color-brand`, `--color-danger`...) au-dessus de la palette Tailwind native. Aucun rebranding n'est prévu ; une telle couche renommerait des dizaines de classes dès maintenant pour un bénéfice qui ne se matérialise que si un changement d'identité visuelle globale devient un besoin réel (voir §4.7).
- **Pas de presets d'animation pour des patterns qui n'ont pas (ou plus) de consommateur réel.** La liste Fade/Slide/Scale/Bounce/Shake/Hover/Click/Modal/Tooltip/Notification n'est pas créée intégralement : seuls les presets pour des patterns **effectivement dupliqués** sont écrits (Fade, `shake()`, `SPRING_POP` — §4.6). Modal/Tooltip/Notification n'ont aucun composant existant dans le projet ; un "Bounce" n'a plus aucun consommateur depuis la suppression de `RockRune.jsx` (§2.4, §6) et n'est donc pas créé non plus. Ces presets s'ajouteront le jour où un vrai composant les consommera, pas avant.
- **Pas de `clsx`/`cva` comme nouvelle dépendance npm.** Un helper maison `cx()` d'une dizaine de lignes (`components/ui/classNames.js`) couvre le même besoin sans dépendance externe — cohérent avec le fait que le projet n'en a jamais eu besoin jusqu'ici (voir §2.6, §4.7).

### 2.6 Gestion des dépendances

**Règle stricte, identique à `ARCHITECTURE_GUIDELINES.md` §2.6 : aucune dépendance npm n'est ajoutée avant d'être utilisée**, et aucune n'est ajoutée quand une solution locale d'une dizaine de lignes couvre le même besoin sans élargir la surface de maintenance. C'est le raisonnement qui tranche §2.5 en faveur d'un `cx()` fait maison plutôt que `clsx`.

À l'inverse, `framer-motion`, `@dnd-kit/*` et `react-router-dom` sont déjà des dépendances pleinement utilisées et légitimes — ce principe n'est pas un argument contre toute dépendance, seulement contre celles qui n'ont pas encore de consommateur réel. `src/utils/pathfinding.js` (classe `Pathfinder`, jamais importée nulle part dans `src`) était l'équivalent frontend exact des dépendances `euclid`/`uuid` non utilisées côté moteur : du code qui laissait croire qu'une fonctionnalité existait côté front alors qu'elle était entièrement déléguée à `engine` — supprimé le 2026-07-28 (§6).

### 2.7 Stabilité de l'API des composants

Les props d'un composant sont son **interface publique**, au même titre que ce que `lib.rs` exporte en `pub` côté moteur (`ARCHITECTURE_GUIDELINES.md` §2.7) — à la différence près qu'ici rien ne l'impose par le compilateur : c'est une discipline à tenir par convention.

**Règle : un nom de prop a un seul sens dans tout le projet.** Contre-exemple qui avait cours dans le code jusqu'au 2026-07-28 : `components/Button/Button.jsx` routait `onComplete ?? onClick` vers `ButtonHold`/`ButtonDumper` mais utilisait `onClick` seul pour `variant="classic"`. Ce n'était pas théorique : `src/pages/Home.jsx` passait `onComplete` sur `variant="dumper"` et `variant="hold"`, tandis que `src/components/craft/TableScroll.jsx` passait `onClick` sur le **même** `variant="dumper"` — les deux usages ne fonctionnaient que grâce au fallback `??`, ce qui masquait l'incohérence plutôt que de la révéler. **Le prop public de complétion s'appelle désormais `onClick` partout**, y compris à l'intérieur de `ButtonHold`/`ButtonDumper` ; `onComplete` a été retiré (§6, résolu).

Une fois ce document appliqué, un composant sous `ui/` ne doit exposer que des props documentées (JSDoc, §5.1) — un consommateur ne doit jamais avoir besoin de lire l'implémentation pour savoir ce qu'une prop attend.

### 2.8 Organisation des données — un rôle, une source

Un mapping ou une constante ne doit avoir **qu'une seule définition** dans le projet. `RESOURCE_ICONS` (ressource → emoji) était défini deux fois : `src/components/ui/dnd/Slot.jsx` et `src/components/terrain/Plain.jsx` — avec une divergence (`Plain.jsx` avait une entrée `Grass` que `Slot.jsx` n'avait pas). Ce n'était pas un simple doublon cosmétique : le jour où une icône change, rien ne garantissait que les deux copies soient mises à jour ensemble. **Règle : ce genre de table statique va dans `src/config/` (`config/resources.js`), importée par tous ses consommateurs** — jamais recopiée. Unifié le 2026-07-28 (§6).

Ce principe fait écho à `ARCHITECTURE_GUIDELINES.md` §2.8 sur l'ambiguïté de `Position` (case de grille vs pixel local d'une tuile) : le document du moteur note déjà que le frontend confirme cette confusion (`HexGrid.jsx` convertit une position logique vers un pixel via `toPixel`, tandis que `TileCanvas.jsx` envoie un clic brut en pixels directement dans `Command::Gather`). Ce n'est pas une règle à dupliquer ici — c'est la même règle, elle vaut aux deux bouts de la frontière Rust/JS : quand deux usages d'une même donnée représentent des repères différents (case de grille vs pixel local 0..400), un commentaire ne suffit pas à les distinguer de façon fiable, et un renommage de variable qui rend le repère explicite (`gridPosition` vs `localPoint`) est la version applicable côté frontend de la même correction.

---

## 3. Organisation des dossiers

### 3.1 Ce qu'un composant `ui/` peut et ne doit jamais contenir

**Peut contenir :**
- De l'état d'interaction local (`useState`/`useRef` : `hovered`, `pressed`, `progress` d'un hold, phase d'une séquence d'animation).
- Des props qui *décrivent* un concept de jeu, sans jamais le *consulter*. C'est une distinction fine et volontaire : `Slot.jsx` reçoit `resource={{name, quantity}}` — une forme qui vient du jeu — mais reste un composant `ui/` légitime parce qu'il ne fait ni appel moteur ni lecture de Context ; il ne fait qu'afficher ce qu'on lui donne. C'est exactement le même raisonnement que `HexTile.jsx`/`PlayerToken.jsx`, déjà cités comme bons exemples de découplage.
- De l'animation orchestrée localement (framer-motion), à condition d'utiliser les presets partagés (§4.6) plutôt que des valeurs réinventées.

**Ne doit jamais contenir :**
- Un import de provider ou de `src/api/` (§2.3).
- Une constante de mapping propre au jeu qui devrait vivre dans `config/` (ex. `RESOURCE_ICONS`, désormais dans `config/resources.js` — §2.8, §6).
- Un positionnement en dur qui présuppose un parent précis (`absolute inset-0` sans le faire dépendre de `className`) — un composant `ui/` doit pouvoir être réinséré dans n'importe quel flux de mise en page.

### 3.2 Ce qu'un composant de domaine peut et ne doit jamais contenir

**Peut contenir :**
- De l'orchestration de plusieurs composants `ui/` pour un système de jeu précis (`TableScroll` compose `DragEntity`, `DropZone`, `ScrollCraft`, `Button`).
- Un appel à un provider ou à un hook dédié pour lire/écrire l'état du jeu.
- De la dérivation de données via `useMemo` (bon exemple déjà en place : `ScrollCraft.jsx` lignes 18-28, qui éclate une recette demandant "2x Bois" en 2 slots à l'unité, en fonction de l'inventaire courant).

**Ne doit jamais contenir :**
- Un appel `invoke`/`listen` direct (§2.1) — c'était la dette de `TableScroll.jsx` et `TileCanvas.jsx`, résolue par extraction dans `useCraft()`/`useTile()` (§3.4).
- Une réimplémentation d'un rôle visuel générique déjà présent ailleurs (le pattern "carte sombre", "en-tête de section" ou "bouton pilule" ne se réécrit jamais localement une fois `ui/Panel.jsx`/`ui/SectionHeader.jsx`/`ui/Button/styles.js` en place, §4.7).
- Une dimension de mise en page qui empêche sa réutilisation dans un contexte différent sans le justifier : `ScrollCraft.jsx` fixe `w-3xs` en dur (ligne 34) — acceptable pour un composant qui n'a aujourd'hui qu'un seul contexte d'usage (la grille de craft), mais à surveiller si un deuxième contexte d'usage apparaît (cf. §4.9, critère de refactorisation).

### 3.3 Dépendances autorisées entre couches

```
utils/, config/                    (aucune dépendance vers React/le jeu — algorithmes/constantes pures)
        ↑
api/, animations/                  (I/O Tauri ou orchestration DOM/framer-motion — impurs par nature, isolés l'un de l'autre)
        ↑
providers/                          (Context + state, dépendent de api/, jamais l'inverse)
        ↑
hooks/                               (logique réutilisable, dépendent des providers ou de api/ pour un usage local unique)
        ↑
components/ui/                       (zéro dépendance vers providers/api/hooks — uniquement des props)
        ↑
components/<domaine>/                (composent ui/, lisent providers/hooks, jamais l'inverse)
        ↑
pages/                                (composent des composants de domaine pour une route)
```

Un composant `ui/` ne remonte jamais vers un provider ou une page, et deux domaines ne s'importent jamais latéralement — c'est la transposition directe de `ARCHITECTURE_GUIDELINES.md` §3.3 côté frontend.

### 3.4 Décisions tranchées

**`hooks/` et `providers/` sont deux conventions distinctes, pas une hiérarchie.** `src/hooks/` était vide à l'origine — toute la logique de hook du projet vivait en réalité dans `src/providers/` (`useInventory`, `useMap`, `usePlayer`, chacun co-localisant Context + abonnement moteur + hook public). Ce pattern de co-location est bon et reste la convention pour tout état **partagé entre plusieurs sous-arbres de composants sans parenté directe**. `hooks/` accueille ce qui n'a **pas besoin** de sa propre Context — peuplé le 2026-07-28 (§6) :
- de la logique UI pure sans aucune notion de jeu (`useHoldProgress`, extrait de `ButtonHold.jsx` ; `useMergedRefs`, extrait du pattern dupliqué entre `ButtonDumper.jsx` et `DropZone.jsx`) ;
- une composition légère au-dessus d'un provider existant, sans détenir de Context propre (`useIsCamp`, qui consomme `usePlayer()` en interne — extrait du duplicata exact entre `MainLayout.jsx` et `CampLayout.jsx`) ;
- un appel moteur ponctuel et local à un seul consommateur (`useTile`, qui encapsule `getTile()` + l'annulation déjà présente dans `TileCanvas.jsx` ; `useCraft`, qui encapsule tout l'état et la logique auparavant dans `TableScroll.jsx` — positionnement, DnD, déclenchement de `craft()`, écoute `InventoryUpdated`/`CraftFailed`).

**Critère de bascule d'un hook vers un provider : dès qu'une donnée moteur est consommée par plus d'un sous-arbre sans parenté directe, elle est promue en provider.** Tant qu'elle n'a qu'un seul consommateur, un hook dans `hooks/` suffit.

**`src/utils/api.js` a déménagé vers `src/api/engine.js`** (2026-07-28). Ce n'était pas un renommage cosmétique : `utils/` est réservé aux algorithmes purs, sans effet de bord (§3.1 côté moteur, §3.3 ici) — `api.js` fait des I/O (`invoke`, `listen`), il n'avait jamais sa place dans `utils/`. Le contenu n'a pas changé : `sendCommand()`, `listenEngineEvents()`, et un wrapper par variante de `Command` restent la seule porte de sortie Tauri.

**`src/utils/animation.js` a été scindé, pas seulement déplacé** (2026-07-28). La seule fonction réellement pure — `easeOutCubic` — ne touche jamais le DOM ; elle est dans `utils/easing.js`. Tout ce qui orchestre `framer-motion`/le DOM (`shake`, les générateurs de gradient CSS `radialGlow`/`progressGradient`) est dans `animations/`, qui est impur par nature et assumé comme tel (détail complet en §4.6). Les autres exports de l'ancien fichier (`clamp`, `progress`, `easeInOutQuad`, `wait`, `playDumperAnimation`, `pulse`) étaient du code mort et ont été supprimés (§6).

**L'ordre de montage des providers est désormais protégé par le code, pas seulement par convention.** `App.jsx` montait `MapProvider > PlayerProvider > InventoryProvider` à cause d'une dépendance interne non documentée : `PlayerProvider` appelle `useMap()`, donc doit être monté sous `MapProvider`, sans qu'aucun commentaire du code ne le dise. `providers/AppProviders.jsx` compose désormais les trois dans le bon ordre et documente en JSDoc pourquoi cet ordre est obligatoire ; `App.jsx` n'importe plus que `<AppProviders>` (§6, résolu).

---

## 4. Règles de développement

### 4.1 Nommage

- Nom de fichier = nom du composant/concept qu'il porte, en PascalCase pour un composant (`HexTile.jsx`), en camelCase pour un hook (`useIsCamp.js`) ou un utilitaire (`easing.js`).
- Un hook custom commence toujours par `use`, même s'il ne détient pas de Context — c'est déjà la convention React standard, à appliquer aussi aux futurs hooks de `hooks/`.
- Un nom de callback prop suit le format `on` + verbe (`onHoverChange`, `onDiscoveryDone` — déjà bien respecté) et **a un seul sens dans tout le projet** (voir §2.7 pour le contre-exemple `onComplete`/`onClick`).
- Un composant qui délègue entièrement son rendu à un sous-composant selon une prop (`Button.jsx` → `ButtonHold`/`ButtonDumper`) documente ce routage en tête de fichier, pas seulement par la lecture du corps de la fonction.

### 4.2 Structure des fichiers

Un fichier = une préoccupation. Le signal de découpage n'est pas la longueur mais le **mélange** : état + logique métier + appel moteur + présentation dans un seul fichier. `src/components/craft/TableScroll.jsx` mélangeait DnD, déclenchement de craft, écoute d'events moteur et affichage du statut — c'était un candidat réel à scinder, résolu en extrayant l'état/la logique dans le hook `useCraft()` (§3.4), le composant ne gardant plus que le rendu.

**La longueur seule ne justifie pas un découpage** : un fichier JSX avec beaucoup d'animation chorégraphiée (constantes d'easing/durée nommées, séquences `framer-motion` imbriquées) peut légitimement dépasser 150-200 lignes sans mélanger les préoccupations, tant qu'il reste une seule responsabilité cohérente. Le signal à surveiller n'est donc jamais "ce fichier est long" mais "ce fichier fait plusieurs métiers à la fois" — voir §4.9 pour le critère complet.

`src/components/terrain/Plain.jsx` (144 lignes, 4 sous-écrans visuellement indépendants : vue de tuile + popups de découverte, analyse de zone, actions, inventaire) est un cas à surveiller : à scinder en sous-composants une fois qu'un deuxième écran de terrain (au-delà de "Plaine") sera écrit, pour éviter de dupliquer sa structure interne par copier-coller (cf. §4.9).

### 4.3 Rôles d'une feature front-end

Une feature de domaine (`craft/`, `map/`, `terrain/`...) s'appuie sur des rôles de fichier bien distincts, chacun avec une responsabilité propre :

| Rôle | Où | Contient | Ne contient jamais |
|---|---|---|---|
| Page | `pages/*.jsx` | Orchestration route-level : lit providers/hooks, compose des composants de domaine ; peut appeler `api/` directement pour une commande fire-and-forget sans état ni abonnement (§2.1) | Un appel `api/` avec état, annulation ou abonnement d'event géré localement, logique métier |
| Layout | `components/navigation/*.jsx` | Coquille de routing + nav, état dérivé simple via hook | Logique métier, appel moteur direct |
| Domaine | `components/<domaine>/*.jsx` | État UI local, orchestration de primitives `ui/`, lecture/écriture moteur via provider/hook | Appel `invoke`/`listen` direct (§2.1) |
| UI | `components/ui/**` | Présentation + interaction locale, peut recevoir des props "à forme de jeu" (§3.1) | Context, `invoke`/`listen`, logique métier |
| Hook | `hooks/*.js` | Logique stateful réutilisable sans Context propre | Un Context (sinon ça devient un provider, §3.4) |
| Provider | `providers/**` | Context + abonnement moteur + hook public, un domaine = un fichier co-localisé | Rendu JSX de présentation |
| API | `api/engine.js` | Unique passerelle Tauri (`sendCommand`, `listenEngineEvents`, un wrapper par variante de `Command`) | Logique métier, état |
| Animations | `animations/**` | Presets/orchestration framer-motion nommés et partagés | État React, logique métier |
| Config | `config/*.js` | Constantes statiques transverses (mesures, mappings) | Logique |
| Utils | `utils/*.js` | Algorithmes purs, sans état, sans effet de bord | `invoke`, `animate()`, tout ce qui touche le DOM ou le Context |

Une feature n'a pas à porter tous ces rôles : `terrain/TileCanvas.jsx` n'a besoin ni de layout ni d'animation dédiée, et c'est très bien ainsi — ce tableau énumère les rôles *possibles*, pas une check-list obligatoire par domaine (même logique que le CMSSV du moteur, `ARCHITECTURE_GUIDELINES.md` §4.3).

### 4.4 Frontières et encapsulation

- **Un Context ne s'expose jamais directement : toujours via un hook qui lève une erreur explicite hors de son Provider.** C'est déjà la convention en place sur les trois providers existants (`useMap`, `usePlayer`, `useInventory` lèvent chacun `throw new Error("useX must be used within <XProvider>")`) — à reproduire pour tout futur provider, sans exception.
- **Props explicites, spread en dernier recours.** `...other`/`...props` n'est légitime que pour transmettre des attributs DOM/`aria-*`/`className` à l'élément racine (déjà le cas dans `Inventory.jsx`, `TableScroll.jsx`) — jamais comme substitut à la déclaration d'une vraie prop métier. C'est exactement l'absence de déclaration explicite qui a permis à l'incohérence `onComplete`/`onClick` (§2.7) de passer inaperçue : si `Button.jsx` déclarait un seul nom de prop sans fallback `??`, l'usage incohérent de `TableScroll.jsx` aurait échoué silencieusement au lieu de sembler fonctionner.
- **Le positionnement dans la mise en page du parent appartient toujours à l'appelant** (§2.4) — un composant ne code jamais en dur `absolute inset-0` sans le faire dépendre d'un `className` fusionné, sauf s'il a vocation structurelle à être positionné (`DropZone`).

### 4.5 Gestion des états asynchrones et des erreurs

Le projet gère aujourd'hui le chargement/l'échec au cas par cas, sans convention explicite : `PlayerProvider.jsx` a un état `feedback` avec expiration automatique (`FEEDBACK_DURATION_MS = 2500`) pour signaler un déplacement impossible ; `hooks/useCraft.js` a son propre `craftError` avec un `setTimeout` d'expiration codé en dur (1200 ms) pour le même genre de message temporaire. Ce sont deux réimplémentations indépendantes du même pattern "message d'erreur qui s'efface tout seul".

**Règle : ce pattern (état + expiration automatique) est légitime et doit rester la norme pour un feedback utilisateur temporaire** — mais sa durée ne doit pas être une valeur magique locale à chaque composant qui le réimplémente une nouvelle fois. Tant qu'il n'existe que deux occurrences, ce n'est pas encore un besoin d'extraction en hook partagé (§2.5) ; le jour où un troisième composant a besoin du même pattern, il devient `hooks/useTimedFeedback(durationMs)`.

**Récupération réseau/moteur :** aucun `invoke` n'est aujourd'hui entouré d'un `try`/`catch` — une commande qui échoue silencieusement (rejet de promesse) ne remonte nulle part. Ce n'est pas traité comme une dette bloquante dans ce document (le moteur ne produit aujourd'hui aucune erreur de ce type en usage normal), mais toute nouvelle commande susceptible d'échouer (ex. une validation qui peut être refusée côté moteur) doit prévoir explicitement comment l'échec remonte à l'utilisateur, sur le modèle du pattern `feedback`/`craftError` déjà en place plutôt que par un `.catch()` silencieux.

### 4.6 Système d'animation par presets

`framer-motion` est l'unique librairie d'animation du projet. `src/utils/animation.js` était la seule tentative de centralisation, mais elle était partiellement morte (`playDumperAnimation`, `pulse` n'étaient appelés nulle part) et contournée par les composants qui réimplémentaient leur propre variante localement. Elle a été scindée en `src/animations/` (§3.4) le 2026-07-28 :

- **`springs.js` — un seul ressort par rôle physique, pas par composant.** Trois springs "pop" quasi identiques existaient sans justification physique de diverger : `Button.jsx` classic (`stiffness: 400, damping: 20`), `ButtonHold.jsx` (`stiffness: 300, damping: 20`), `ButtonDumper.jsx` au retour (`stiffness: 400, damping: 18`). **Un seul `SPRING_POP = { type: "spring", stiffness: 400, damping: 20 }`** (la valeur du bouton classique, le plus utilisé) est désormais partagé par les trois. Le spring de `PlayerToken.jsx` (`stiffness: 260, damping: 22, mass: 0.6`) anime un déplacement dans le monde le long d'un chemin — un rôle physiquement différent d'un feedback de pression — et **reste distinct**, nommé `SPRING_TOKEN_MOVE` : ne pas tout fusionner par excès de zèle, la règle est "un ressort par rôle physique", pas "un seul ressort pour tout le projet".
- **`shake.js` — une seule implémentation canonique.** Elle porte la gestion `activeShake` (annule proprement un shake en cours) et remplace les deux appels équivalents (`ButtonDumper.jsx`, `intensity: 8, duration: 160`) qui existaient auparavant dans le composant et dans le helper mort `playDumperAnimation` (celui-ci avait une troisième variante divergente, `intensity: 4, duration: 120`, jamais appelée — supprimée avec le reste du code mort, §6). `intensity`/`duration` restent des paramètres d'appel, pas des presets figés.
- **`gradients.js`** — `radialGlow`/`progressGradient` (générateurs de `background-image` CSS consommés par `ButtonHold.jsx`). Ce sont en réalité des fonctions pures (string → string, aucun DOM/état) : elles vivent ici par regroupement thématique avec le reste de l'orchestration visuelle de `ButtonHold`, plutôt que dans `utils/` — un choix éditorial assumé, à ne pas reproduire pour un futur générateur qui n'aurait aucun lien avec une animation.
- **Pas de `durations.js`.** La version initialement envisagée de cette section s'appuyait sur les constantes nommées `TIMING`/`EASE_GRAVITY`/`EASE_IMPACT`/`EASE_BOUNCE` de `RockRune.jsx` comme base à "promouvoir". `RockRune.jsx` a été supprimé le 2026-07-28 (composant jamais branché, §6) avant que ce document ne soit appliqué : ces constantes n'ont donc plus aucun consommateur réel (`EASE_GRAVITY`/`EASE_IMPACT` n'avaient qu'un quasi-doublon dans `ButtonDumper.jsx`, en valeur inline ; `EASE_BOUNCE` n'était utilisé que par `RockRune`). Créer un fichier de constantes pour un seul consommateur inline aurait été exactement l'abstraction anticipée que §2.5 interdit — `ButtonDumper.jsx` garde donc sa courbe d'easing en valeur locale.
- **`presets.js` — uniquement pour des patterns effectivement dupliqués.** Seul `Fade` (`{initial:{opacity:0}, animate:{opacity:1}}`, sans durée imposée) survit à ce critère : 3 occurrences restantes avec des durées volontairement différentes (`Plain.jsx` popups à `1.6`, `NotFound.jsx` à `0.4`, `ButtonDumper.jsx` span "pressed" à `.25`). Pas de "Bounce" (plus aucun consommateur depuis la suppression de `RockRune.jsx` — `ButtonHold.jsx` n'a d'ailleurs jamais utilisé de courbe de rebond, juste un fade+scale par défaut), pas de Modal/Tooltip/Notification (aucun composant de ce type n'existe dans le projet, §2.5). Ces presets s'ajouteront le jour où un vrai composant les consommera.

### 4.7 Système de style Tailwind

Tailwind v4, configuration CSS-first (`src/index.css` = `@import "tailwindcss"` + un bloc `@theme`, pas de `tailwind.config.js`).

- **Tokens de surface — trois rôles, trois tokens, déclarés via `@theme` dans `index.css`.** Quatre teintes de fond sombre quasi identiques existaient pour un même rôle "panneau" : `#1e2535` (fond du `body`, dupliqué en dur sur les conteneurs racines de `MainLayout.jsx`/`CampLayout.jsx` alors que le `body` le portait déjà globalement), `#161d2e` (la teinte majoritaire), `bg-slate-900` dans `Plain.jsx` (utilisé de façon interchangeable avec `#161d2e` pour le même rôle visuel sans que rien ne les distingue), et `#12192a` (nav de `CampLayout.jsx` uniquement). Résolu en 3 tokens :
  - `--color-surface-app` (`#1e2535`) — fond global, porté uniquement par `body` ; `MainLayout`/`CampLayout` ne le redéclarent plus sur leur conteneur racine.
  - `--color-surface-panel` (`#161d2e`) — tout panneau de contenu (classe `bg-surface-panel`) ; `Plain.jsx` a migré ses trois `bg-slate-900` vers ce token.
  - `--color-surface-nav` (`#12192a`) — toute barre de navigation (classe `bg-surface-nav`) ; **`MainLayout.jsx` a migré sa nav vers ce token** (elle utilisait `#161d2e` auparavant), pour donner à la navigation un rôle visuel distinct du contenu, cohérent avec ce que `CampLayout` faisait déjà.
- **`emerald`/`slate` uniquement — jamais `green`/`gray`.** `emerald` et `slate` sont l'écrasante majorité de la palette utilisée ; les deux dérives isolées qui existaient (`bg-green-500` sur la barre de progression de `Plain.jsx`, `border-gray-500` — seule occurrence de `gray` du projet — sur `DropZone.jsx`) ont été corrigées vers `bg-emerald-500`/`border-slate-600`. Ce sont des noms Tailwind standards — la règle reste purement conventionnelle, aucun token `@theme` supplémentaire n'est nécessaire.
- **Pas de couche de tokens sémantiques de couleur** (validé, §2.5) : les noms Tailwind natifs (`emerald-600`, `slate-700`...) restent la référence directe dans le JSX, avec cette seule convention écrite.
- **Assemblage des classes conditionnelles via un helper maison `cx()`** (validé, §2.5, §2.6) plutôt qu'une nouvelle dépendance. Le projet assemblait ses classes de trois façons incohérentes selon les fichiers : chaîne ternaire inline, `[array].join(" ")`, ou classes statiques simples. `components/ui/classNames.js` exporte `cx(...parts)` (filtre les valeurs falsy, joint par espace) ; toute composition conditionnelle de classes passe désormais par cette fonction.
- **Base de classes partagée pour les boutons "pilule".** Les trois variantes du bouton pilule vert avaient des divergences non intentionnelles : `Button.jsx` classic avait `hover:bg-emerald-500`, `active:scale-95` et `disabled:opacity-50 disabled:cursor-not-allowed` ; `ButtonHold.jsx` avait `hover:bg-emerald-500`/`active:scale-95` mais **aucune classe visuelle `disabled:`** (seul l'attribut HTML `disabled` était posé) ; `ButtonDumper.jsx` avait `disabled:opacity-50` mais **ni `hover:bg-emerald-500` ni `active:scale-95`**. `PILL_BUTTON_BASE` dans `ui/Button/styles.js`, composée via `cx()` par les trois variantes, garantit désormais que les trois boutons ont le même comportement `hover`/`active`/`disabled` par construction plutôt que par recopie manuelle à chaque fichier.
- **`ui/SectionHeader.jsx` pour les en-têtes de section.** Le pattern `uppercase tracking-widest text-slate-400` (tantôt `font-semibold`, tantôt `font-bold`) était répété 7 fois ; `Plain.jsx` divergeait sans raison apparente sur deux de ses sections (`text-xs font-bold uppercase tracking-[0.2em] text-blue-300`) — traité comme une dérive corrigée, pas une variante légitime : rien ailleurs dans le projet n'utilisait `blue-300` comme accent de titre. `SectionHeader` accepte une prop `as` (`h2` par défaut) pour garder la bonne balise sémantique quand `h2` briserait la hiérarchie de titres (ex. `NotFound.jsx`, qui l'utilise en `as="p"`).
- **`ui/Panel.jsx` pour le pattern "carte sombre"** (`rounded-xl border border-slate-700 bg-surface-panel`, cf. tokens de surface ci-dessus). `ScrollCraft.jsx` n'a volontairement **pas** été migré vers `Panel` : sa bordure conditionnelle (`active ? "border-emerald-400" : "border-slate-800"`) entrerait en conflit avec la bordure par défaut de `Panel` (deux classes `border-*` de même spécificité, l'ordre de préséance n'est pas garanti par l'ordre du texte dans `className`) — forcer ce composant dans l'abstraction partagée aurait été plus risqué que la duplication qu'elle est censée résoudre ; il garde sa propre construction de classes, avec uniquement le token `bg-surface-panel` appliqué.
- **Pas de tokens `@theme` pour spacing/radius** : les valeurs utilisées (`rounded-xl`, `rounded-lg`, `px-5 py-2.5`...) sont déjà celles par défaut de Tailwind, sans preuve d'un besoin de valeurs custom répétées — ne pas en créer par anticipation (§2.5).

### 4.8 Conventions de props

- **Valeurs par défaut via déstructuration** (`{ layout = "tile" }`), jamais `defaultProps` — déjà la convention en place partout, et plus seulement une préférence stylistique : React 19 a retiré le support de `defaultProps` sur les composants fonction.
- **`className` en passthrough obligatoire** pour tout composant de `ui/`, et pour tout composant de domaine conçu pour apparaître sur plus d'une page.
- **Props booléennes nommées par état, pas par action** (`disabled`, `crafting`, `isMoving`, `isCamp` — déjà cohérent dans le code, à documenter comme règle plutôt que laisser implicite).
- **Un composant ne reçoit jamais un objet non typé par JSDoc "au cas où" quand des props explicites suffisent** — les bons exemples existants (`HexTile.jsx`, `PlayerToken.jsx`) reçoivent des props individuelles nommées plutôt qu'un objet de configuration fourre-tout ; à ériger en règle pour tout nouveau composant.
- Voir §2.7 pour la règle "un nom de prop, un seul sens" et le cas `onComplete`/`onClick`, corrigé le 2026-07-28.

### 4.9 Critères de création de composant / critères de refactorisation

**Créer un nouveau composant `ui/` quand :**
- un bloc JSX se répète ≥2 fois avec seulement des props qui varient (c'était le cas pour la "carte sombre" et les en-têtes de section, résolus en `Panel`/`SectionHeader` — §4.7) ;
- un rôle visuel se répète ≥3 fois à travers des domaines non liés entre eux.

**Refactoriser quand (déclencheurs concrets, la taille de fichier n'étant qu'un signal, jamais la règle — §4.2) :**
- un appel `invoke`/`listen` est trouvé hors de `api/`, d'un provider ou d'un hook dédié (§2.1) ;
- un composant impose son propre positionnement en dur et empêche sa réutilisation dans un autre parent de mise en page (§2.4) ;
- deux composants réimplémentent indépendamment la même logique — vérifier d'abord qu'un hook/preset n'existe pas déjà avant d'en écrire une troisième copie (cas déjà résolus : fusion de refs via `useMergedRefs`, springs via `SPRING_POP`) ;
- une dimension fixée en dur (`w-3xs` sur `ScrollCraft.jsx`) empêche un second contexte d'usage qui apparaît réellement — pas en anticipation d'un contexte hypothétique.

### 4.10 Performance et rendu

- **Pas de `useMemo`/`useCallback`/`React.memo` par réflexe** — seulement où un calcul est réellement coûteux ou une valeur sert de dépendance stable pour un effet/un composant mémoïsé. Bon exemple déjà en place : `MapProvider.jsx` mémoïse `viewBox` (lignes 19-24), `toPixel`/`getTile` (lignes 26-27), et la valeur de contexte elle-même (lignes 44-47) — sans quoi chaque re-render du provider recréerait des références nouvelles et invaliderait tous ses consommateurs inutilement.
- **Exemple canonique de "quand mémoïser" : `HexTile.jsx` est enveloppé dans `React.memo`.** `hovered` vit dans l'état de `HexGrid.jsx` : sans mémoïsation, un survol d'une seule tuile re-render **toutes** les tuiles de la grille, alors que les props de chaque `HexTile` (`onClick={moveTo}`, `onHoverChange={setHovered}`) sont déjà des références stables (`moveTo` vient de `usePlayer()`, `setHovered` est un setter `useState`). Un gain concret et à faible risque, résolu le 2026-07-28.
- **Ne pas mémoïser les composites de page** (`Plain.jsx`, `TableScroll.jsx`) : leurs props/enfants changent de toute façon à chaque rendu utile, la mémoïsation n'apporterait rien.
- **Dérivation de données via `useMemo` plutôt que `useEffect`+`useState`**, déjà bien fait dans `ScrollCraft.jsx` (`needSlots`, lignes 18-28) — à citer comme référence positive pour tout futur calcul dérivé de props.
- **Clés de liste stables** : déjà bien fait (`item.id` dans `TableScroll`, `drop.uuid` dans `Plain.jsx` ligne 54) — à reproduire, jamais un index de tableau comme clé pour une liste qui peut être réordonnée.

---

## 5. Documentation

### 5.1 JSDoc — obligatoire

Une JSDoc est obligatoire pour :

- **Tout composant de `components/ui/`** — ce sont les plus réutilisés, donc à plus fort effet de levier. Bon exemple déjà en place, à reproduire à l'identique : `HexTile.jsx` (lignes 4-14) documente chaque prop avec son unité/sa nature (`position` en pixels, `at` en coordonnées logiques) — la distinction qui, côté moteur, justifierait deux types séparés (`ARCHITECTURE_GUIDELINES.md` §2.8) est ici portée par la JSDoc à défaut de typage statique.
- **Tout provider** — la forme du Context **et** ses dépendances vis-à-vis d'autres providers. `PlayerProvider.jsx` documente son rôle métier et, depuis `AppProviders.jsx` (§3.4), documente aussi explicitement qu'il doit être monté sous `MapProvider` (dépendance à `useMap()`) — c'est le niveau attendu pour tout futur provider qui dépendrait d'un autre.
- **Tout hook de `hooks/`** — paramètres, forme du retour, et la condition qui justifierait sa promotion en provider (§3.4).
- **Tout composant d'animation chorégraphiée non triviale** — le niveau attendu est celui d'un commentaire qui explique un choix non déductible du code : par exemple, si une séquence est pilotée par des jetons de génération plutôt que par le cleanup `useEffect` classique (pour survivre à un aller-retour rapide de props sans se faire interrompre), ce choix et ce qu'il évite doivent être écrits en tête de fichier — pas seulement "ce composant anime X".

**Non obligatoire** pour les `pages/` (orchestration fine, auto-descriptive) ni pour un composant de domaine trivial à une seule responsabilité.

### 5.2 Commentaires — jamais le "quoi", toujours le "pourquoi"

Règle identique à `ARCHITECTURE_GUIDELINES.md` §5.2 : un commentaire qui reformule ce que le code dit déjà est interdit. Un commentaire est requis pour une règle métier cachée, une décision d'architecture, ou une limitation connue — à condition de rester vrai : un commentaire faux est pire qu'aucun commentaire, humain comme IA le prendront pour argent comptant.

Bon exemple déjà présent à préserver (`TileCanvas.jsx`, lignes 6-11) :
> `/** Rendu 400x400 (même repère que le moteur, aucune conversion d'échelle) des zones (`Area`) de la tile occupée par le joueur [...] Un clic envoie sa position brute dans ce même repère à `onGather` : c'est le moteur qui décide, via hit-test, quelle zone a été touchée. */`

C'est exactement le type d'information qu'aucun nom de variable ne peut porter seul — et la preuve, comme côté moteur (§2.8), qu'un repère de coordonnées ambigu (case de grille vs pixel local) a besoin d'être documenté à chaque endroit où il traverse une frontière, faute d'un type qui le distinguerait pour de bon.

---

## 6. Pérennité

Ce document doit rester la référence unique : toute nouvelle fonctionnalité, tout refactor, toute revue de code doit s'y référer et, si une règle s'avère fausse ou datée, **ce document doit être corrigé au même titre que le code**.

Priorité d'application recommandée, du plus structurant au plus local — **toutes appliquées le 2026-07-28** :

1. ~~Séparer `components/ui/` des composants de domaine (§2.2)~~ — **fait**.
2. ~~Faire passer `TableScroll.jsx` et `TileCanvas.jsx` par un hook dédié plutôt qu'un appel moteur direct (§2.1, §3.2)~~ — **fait** (`useCraft`, `useTile`).
3. ~~Corriger l'incohérence de prop `onComplete`/`onClick` sur `Button`/`ButtonHold`/`ButtonDumper` (§2.7)~~ — **fait**.
4. ~~Peupler `hooks/` et déplacer `utils/api.js` → `api/engine.js` (§3.4)~~ — **fait**.
5. ~~Construire `animations/` et migrer les springs/shakes dupliqués (§4.6)~~ — **fait**, périmètre réduit par rapport à la version initiale de cette section (pas de `durations.js`, pas de preset "Bounce" — cf. §4.6).
6. ~~Déclarer les tokens `@theme` de surface et corriger les couleurs isolées (§4.7)~~ — **fait**.
7. ~~Nettoyer le code mort~~ — **fait** (voir annexe).

Vérifié à chaque étape par `npm run build` (le projet n'a pas de suite de tests front, `package.json` ne déclare ni `vitest` ni `@testing-library/*`). Reste un point qui nécessite une vérification manuelle en environnement graphique, non exécutable par ce moyen : `hooks/useHoldProgress.js` est une extraction 1:1 depuis `ButtonHold.jsx` (comportement non modifié en principe), mais son cycle de maintien-relâchement (reprise automatique si le pointeur reste enfoncé après complétion, retour doux à zéro sur relâchement anticipé) n'a pas pu être testé visuellement après l'extraction — à vérifier sur les deux consommateurs (`Home.jsx`, `Plain.jsx`) avant de considérer ce point clos.

### Annexe — constats concrets relevés lors de cette revue (dernière mise à jour : 2026-07-28)

Cette liste documente ce qui a été identifié pour que personne (humain ou IA) n'ait à le redécouvrir, et pour que chaque élément soit retiré de cette annexe au fur et à mesure qu'il est traité.

**Non résolu :**
- **`ButtonHold` accessible par deux chemins** — via la façade `Button variant="hold"`, et directement importé par `src/components/terrain/Plain.jsx`. Les deux fonctionnent (même composant), mais c'est une incohérence d'accès à trancher : soit `Plain.jsx` passe par la façade `Button`, soit l'accès direct devient la convention documentée pour les cas qui n'ont pas besoin du routage par `variant`.
- **Vérification visuelle manquante pour `useHoldProgress`** — extraction fidèle depuis `ButtonHold.jsx` (§6, résolu pour la partie structurelle), mais le cycle de maintien-relâchement n'a pas pu être testé dans un navigateur lors de cette session (environnement sans affichage). À vérifier sur `Home.jsx` et `Plain.jsx` avant de considérer ce point clos.

**Résolus (2026-07-28) :**
- **Suppression de `RockRune.jsx`/`RockRuneMarks.jsx`** — bloc d'animation de craft ("pierre qui s'écrase") jamais committé, zéro import ailleurs dans le code (jamais branché à `TableScroll`), abandon assumé de cette fonctionnalité plutôt qu'un chantier à finir. Conséquence directe sur §4.6 : les constantes `TIMING`/`EASE_GRAVITY`/`EASE_IMPACT`/`EASE_BOUNCE` qu'il portait n'ont plus de consommateur réel et n'ont pas été promues dans `animations/`.
- **Appels moteur directs hors provider/hook** — `TableScroll.jsx` (`craft()`, `listenEngineEvents()`) et `TileCanvas.jsx` (`getTile()`), désormais dans `hooks/useCraft.js` et `hooks/useTile.js`.
- **Incohérence de prop `onComplete`/`onClick`** — unifiée sur `onClick` partout (`Button`, `ButtonHold`, `ButtonDumper`, `Home.jsx`, `Plain.jsx`).
- **`ui/` vs domaine non distingué dans l'arborescence** — `components/ui/` créé (`Button/`, `dnd/`, `NavBar`, `Panel`, `SectionHeader`, `classNames`).
- **Ordre de montage des providers non protégé par le code** — `providers/AppProviders.jsx` créé, `App.jsx` simplifié.
- **`RESOURCE_ICONS` dupliqué** — unifié dans `config/resources.js`.
- **Pattern `setRefs` dupliqué** — extrait dans `hooks/useMergedRefs.js` (`ButtonDumper.jsx`, `DropZone.jsx`).
- **`isCamp` + structure de nav dupliqués** — extraits dans `hooks/useIsCamp.js` et `components/ui/NavBar.jsx`.
- **3 springs "pop" dupliqués** — unifiés en `SPRING_POP` (`animations/springs.js`).
- **3 définitions de `shake()`** — unifiées en une seule (`animations/shake.js`) ; la variante morte de `playDumperAnimation` a été supprimée avec la fonction elle-même.
- **4 teintes de fond sombre** — résolues en 3 tokens `@theme` (`--color-surface-app/panel/nav`).
- **`bg-green-500`/`border-gray-500`** — corrigés en `emerald-500`/`slate-600`.
- **En-têtes de section incohérents** (7 occurrences, dont la dérive `text-blue-300`/`tracking-[0.2em]` de `Plain.jsx`) — unifiés via `ui/SectionHeader.jsx`.
- **3 boutons pilule non alignés** — unifiés via `PILL_BUTTON_BASE` (`ui/Button/styles.js`).
- **`#1e2535` redéclaré en dur** sur `MainLayout.jsx`/`CampLayout.jsx` — retiré, porté uniquement par `body`.
- **Code mort** — `src/utils/pathfinding.js`, `public/assets/react.svg`, et 6 des 9 exports de l'ex `utils/animation.js` (`playDumperAnimation`, `pulse`, `easeInOutQuad`, `clamp`, `progress`, `wait`) supprimés ; seuls `shake`, `easeOutCubic`, `radialGlow`, `progressGradient` ont survécu, répartis entre `animations/` et `utils/easing.js`.
- **`console.log` oubliés** — retirés (`TableScroll.jsx`, `PlayerProvider.jsx`, `Home.jsx`, dont l'`useEffect` associé qui n'avait plus d'autre contenu).
- **Routes non déclarées de `CampLayout.jsx`** — le lien "Craft" (`/craft`, doublon cassé d'"Imprimerie") a été retiré ; le lien "Four" (`/camp/oven`) pointe désormais vers une page stub `pages/Oven.jsx` (même pattern que `Settings.jsx`), route ajoutée dans `App.jsx`.
- **`HexTile.jsx` non mémoïsé** — enveloppé dans `React.memo`.

**Composants de référence à préserver tels quels (bons exemples déjà en place) :**
- `src/components/map/HexTile.jsx` — props explicites, JSDoc complète, aucune logique métier.
- `src/components/map/PlayerToken.jsx` — reçoit `position`/`radius` en props, aucune lecture de Context.
- `src/components/inventory/Inventory.jsx` — une seule responsabilité, délègue à `Slot`.
- `src/components/ui/dnd/Slot.jsx` — réutilisé tel quel par `Inventory` et `ScrollCraft`.
- `src/providers/map/MapProvider.jsx` — mémoïsation déjà correcte (§4.10).
- `src/components/craft/ScrollCraft.jsx` — dérivation via `useMemo` (§4.10) ; garde volontairement sa propre construction de classes plutôt que `Panel`, pour éviter un conflit de classes `border-*` (§4.7).
