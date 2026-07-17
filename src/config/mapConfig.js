// Géométrie de la grille
export const HEX_SIZE = 46; // rayon d'un hexagone, en px
export const HEX_GAP = 4;   // écart entre hexagones, en px

// Position de départ du joueur (colonne, ligne)
export const START_POSITION = { x: 4, y: 4 };

/**
 * Types de terrain.
 */
export const TERRAIN = {
  void:   { label: 'Vide',       color: '#12172a', },
  cliff:  { label: 'Falaise',    color: '#3a2a1d', },
  water:  { label: 'Eau',        color: '#2f4a7a', },
  home:   { label: 'Campement',  color: '#8a6a4f', },
  plain:  { label: 'Plaine',     color: '#4f7a34', },
  forest: { label: 'Forêt',      color: '#2c5c30', },
};

// Grille fixe (11 colonnes x 10 lignes), bordée de vide pour cadrer la carte.