use serde::{Deserialize, Serialize};

#[derive(Eq, Ord, PartialEq, PartialOrd, Hash, Copy, Clone, Debug, Serialize, Deserialize, Default)]
pub struct Position {
    pub x: u32,
    pub y: u32,
}

impl Position {
    pub fn sub(&self, other: Position) -> Position {
        Position {
            x: self.x.checked_sub(other.x).unwrap_or(0),
            y: self.y.checked_sub(other.y).unwrap_or(0),
        }
    }
}

/// Convertit une position offset (odd-q) en coordonnées cubiques.
/// Nécessaire pour calculer la vraie distance hexagonale.
fn to_cube(p: Position) -> (i32, i32, i32) {
    let x = p.x as i32;
    let z = p.y as i32 - (x - (x & 1)) / 2;
    (x, -x - z, z)
}

/// Distance hexagonale entre deux positions sur une grille odd-q offset.
/// Utilise les coordonnées cubiques pour un résultat exact et symétrique.
/// Vit dans ce module transverse (plutôt que dans `movement`, son premier
/// consommateur) car `world` en a aussi besoin pour le rayon de révélation
/// du brouillard — deux domaines ne se référencent jamais l'un l'autre.
pub fn hex_distance(a: Position, b: Position) -> u32 {
    let (ax, ay, az) = to_cube(a);
    let (bx, by, bz) = to_cube(b);
    (ax - bx).unsigned_abs()
        .max((ay - by).unsigned_abs())
        .max((az - bz).unsigned_abs())
}