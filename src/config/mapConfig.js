// Géométrie de la grille
export const HEX_SIZE = 46; // rayon d'un hexagone, en px
export const HEX_GAP = 4;   // écart entre hexagones, en px

// Position de départ du joueur (colonne, ligne)
export const START_POSITION = { x: 4, y: 4 };

/**
 * Types de terrain.
 */
export const TERRAIN = {
  void:   { id: 'void',  label: 'Vide',       color: '#12172a', },
  cliff:  { id: 'cliff', label: 'Falaise',    color: '#3a2a1d', },
  water:  { id: 'water', label: 'Eau',        color: '#2f4a7a', },
  camp:   { id: 'camp',  label: 'Campement',  color: '#8a6a4f', },
  plain:  { id: 'plain', label: 'Plaine',     color: '#4f7a34', },
  forest: { id: 'forest',label: 'Forêt',      color: '#2c5c30', },
};

// Grille fixe (11 colonnes x 10 lignes), bordée de vide pour cadrer la carte.