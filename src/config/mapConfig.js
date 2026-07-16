// Géométrie de la grille
export const HEX_SIZE = 46; // rayon d'un hexagone, en px
export const HEX_GAP = 4;   // écart entre hexagones, en px

// Position de départ du joueur (colonne, ligne)
export const START_POSITION = { x: 4, y: 4 };

/**
 * Types de terrain.
 * `cost` = coût de déplacement (0 = infranchissable, utilisé par le pathfinding).
 * `gather` = case où l'action "Fouiller" (commande Rust `Gather`) est proposée.
 *
 * Note: le moteur Rust actuel ne connaît qu'un seul terrain (`Terrain::Plain`)
 * pour tout le monde du joueur — voir engine/src/definitions/terrain.rs.
 * Toutes les cases marquées `gather: true` sont donc pour l'instant équivalentes
 * côté moteur ; la richesse visuelle ci-dessous est gérée côté client en
 * attendant qu'un état de monde (position + terrain par case) soit ajouté au
 * moteur, comme prévu dans IA_PROMPT.md (state/world.rs).
 */
export const TERRAIN = {
  void:   { id: 'void',   label: 'Vide',       color: '#12172a', cost: 0, walkable: false },
  cliff:  { id: 'cliff',  label: 'Falaise',    color: '#3a2a1d', cost: 0, walkable: false },
  water:  { id: 'water',  label: 'Eau',        color: '#2f4a7a', cost: 0, walkable: false },
  home:   { id: 'home',   label: 'Campement',  color: '#8a6a4f', cost: 1, walkable: true,  gather: false },
  plain:  { id: 'plain',  label: 'Plaine',     color: '#4f7a34', cost: 1, walkable: true,  gather: true },
  forest: { id: 'forest', label: 'Forêt',      color: '#2c5c30', cost: 1, walkable: true,  gather: true },
};

// Grille fixe (11 colonnes x 10 lignes), bordée de vide pour cadrer la carte.
export const MAP_LAYOUT = [
  ['void',  'void',   'void',  'void',  'void',  'void',  'void',  'void',  'void',  'void',  'void'],
  ['void',  'cliff',  'plain', 'plain', 'forest','plain', 'plain', 'forest','plain', 'cliff', 'void'],
  ['void',  'plain',  'forest','forest','plain', 'plain', 'forest','plain', 'plain', 'plain', 'void'],
  ['void',  'plain',  'forest','water', 'water', 'plain', 'plain', 'plain', 'forest','plain', 'void'],
  ['void',  'plain',  'plain', 'water', 'home',  'plain', 'plain', 'plain', 'forest','plain', 'void'],
  ['void',  'plain',  'plain', 'plain', 'plain', 'plain', 'water', 'plain', 'plain', 'plain', 'void'],
  ['void',  'forest', 'plain', 'plain', 'plain', 'water', 'water', 'plain', 'forest','plain', 'void'],
  ['void',  'plain',  'forest','plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'void'],
  ['void',  'cliff',  'plain', 'forest','plain', 'plain', 'forest','plain', 'cliff', 'cliff', 'void'],
  ['void',  'void',   'void',  'void',  'void',  'void',  'void',  'void',  'void',  'void',  'void'],
];
