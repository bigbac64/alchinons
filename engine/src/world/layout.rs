use crate::world::terrain::Terrain;
use crate::world::terrain::Terrain::*;

// Carte agrandie (13x15, bordure Void incluse) pour laisser de la place au
// système d'exploration : le camp reste au centre géométrique de la grille,
// entouré d'une zone bien plus vaste que ce que révèle le rayon initial du
// brouillard (voir `Map::from_array` / `Map::reveal`).
pub const MAP_LAYOUT: [[Terrain; 15]; 13] = [
    [Void,  Void,   Void,   Void,  Void,  Void,   Void,  Void,   Void,  Void,   Void,  Void,  Void,   Void,  Void],
    [Void,  Cliff,  Plain,  Plain, Forest,Plain,  Plain, Forest, Plain, Plain,  Forest,Plain, Plain,  Cliff, Void],
    [Void,  Plain,  Forest, Forest,Plain, Plain,  Forest,Plain,  Plain, Plain,  Forest,Plain, Plain,  Plain, Void],
    [Void,  Plain,  Forest, Water, Water, Plain,  Plain, Plain,  Forest,Plain, Plain, Water, Plain,  Plain, Void],
    [Void,  Plain,  Plain,  Water, Plain, Plain,  Plain, Plain,  Forest,Plain, Plain, Water, Water,  Plain, Void],
    [Void,  Plain,  Plain,  Plain, Plain, Plain,  Water, Plain,  Plain, Plain,  Plain, Plain, Forest, Plain, Void],
    [Void,  Forest, Plain,  Plain, Plain, Plain,  Plain, Camp,   Plain, Plain,  Plain, Water, Water,  Plain, Void],
    [Void,  Plain,  Forest, Plain, Plain, Water,  Water, Plain,  Plain, Plain,  Plain, Plain, Forest, Plain, Void],
    [Void,  Plain,  Plain,  Plain, Plain, Plain,  Water, Plain,  Plain, Forest,Plain, Plain, Plain,  Plain, Void],
    [Void,  Cliff,  Plain,  Forest,Plain, Plain,  Plain, Plain,  Plain, Plain,  Forest,Plain, Plain,  Cliff, Void],
    [Void,  Plain,  Plain,  Forest,Plain, Plain,  Forest,Plain,  Plain, Plain,  Plain, Forest,Plain,  Plain, Void],
    [Void,  Cliff,  Plain,  Plain, Plain, Forest, Plain, Plain,  Plain, Cliff,  Plain, Plain, Forest, Cliff, Void],
    [Void,  Void,   Void,   Void,  Void,  Void,   Void,  Void,   Void,  Void,   Void,  Void,  Void,   Void,  Void],
];