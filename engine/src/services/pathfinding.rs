use std::cmp::Reverse;
use std::collections::{BinaryHeap, HashMap};
use crate::definitions::position::Position;

/// Nœud utilisé par l'algorithme A*.
///
/// Chaque nœud représente une position dans la grille ainsi que les
/// informations nécessaires au calcul du chemin.
#[derive(Copy, Clone)]
pub struct PathNode {
    /// Position du nœud dans la grille (point 2D).
    pub position: Position,

    /// Coût cumulé depuis le nœud de départ (g-score).
    g: u32,

    /// Estimation du coût restant jusqu'à la destination (h-score).
    h: u32,

    /// Position du nœud précédent dans le chemin reconstruit.
    parent: Option<Position>,
}



/// fonction de calcul de la distance hexagonale entre deux positions.
/// Permettant de calculer la distance entre deux positions sur une grille hexagonale.
/// utilisable pour de l'heuristique dans l'algorithme A*.
pub fn hex_distance(a: Position, b: Position) -> u32 {
    let dx = b.x as i32 - a.x as i32;
    let dy = b.y as i32 - a.y as i32;
    let adx = dx.unsigned_abs();
    let ady = dy.unsigned_abs();

    // Les diagonales (-1,1) et (1,1) vont toutes les deux vers le bas (dy > 0).
    // Vers le bas : un pas diagonal couvre x et y → distance = max(adx, ady).
    // Vers le haut : seul (0,-1) est disponible → adx + ady pas séparés.
    if dy >= 0 {
        adx.max(ady)
    } else {
        adx + ady
    }
}


fn search<F>(start: Position, goal: Position, matrix: &Vec<Vec<u32>>, heuristic: F) -> Option<Vec<Position>>
where
    F: Fn(Position, Position) -> u32,
{
    let mut open = BinaryHeap::<Reverse<(u32, Position)>>::new();

    let mut nodes = HashMap::<Position, PathNode>::new();

    open.push(Reverse((0, start)));

    nodes.insert(start,
        PathNode {
            position: start,
            g: 0,
            h: heuristic(start, goal),
            parent: None,
        },
    );

    const DIRECTIONS_HEX: [(i32, i32); 6] = [
        (0, -1),
        (1, 0),
        (-1, 1),
        (1, 1),
        (0, 1),
        (-1, 0),
    ];

    while let Some(Reverse((_, current))) = open.pop() {
        if current == goal {
            let mut path = Vec::new();
            let mut cursor = current;

            loop {
                path.push(cursor);

                let node = nodes.get(&cursor).unwrap();

                match node.parent {
                    Some(parent_pos) => cursor = parent_pos,
                    None => break,
                }
            }

            path.reverse();
            return Some(path);
        }

        let current_cost = nodes[&current].g;

        for (dx, dy) in DIRECTIONS_HEX {
            let nx = current.x as i32 + dx;
            let ny = current.y as i32 + dy;

            if nx < 0 || ny < 0 {
                continue;
            }

            let nx = nx as usize;
            let ny = ny as usize;

            if ny >= matrix.len() || nx >= matrix[0].len() {
                continue;
            }

            let tile_cost = matrix[ny][nx];

            if tile_cost == 0 {
                continue;
            }

            let neighbour = Position{x: nx as u32, y: ny as u32};

            let new_cost = current_cost + tile_cost;

            let should_update = match nodes.get(&neighbour) {
                Some(node) => new_cost < node.g,
                None => true,
            };

            if should_update {
                let h = heuristic(neighbour, goal);

                nodes.insert(
                    neighbour,
                    PathNode {
                        position: neighbour,
                        g: new_cost,
                        h,
                        parent: Some(current),
                    },
                );

                open.push(Reverse((new_cost + h, neighbour)));
            }
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pos(x: u32, y: u32) -> Position {
        Position { x, y }
    }

    fn zero_heuristic(_a: Position, _b: Position) -> u32 {
        0
    }

    fn uniform_grid(rows: usize, cols: usize) -> Vec<Vec<u32>> {
        vec![vec![1; cols]; rows]
    }

    #[test]
    fn start_equals_goal() {
        let matrix = uniform_grid(5, 5);
        let result = search(pos(2, 2), pos(2, 2), &matrix, zero_heuristic);
        assert_eq!(result, Some(vec![pos(2, 2)]));
    }

    #[test]
    fn direct_neighbour() {
        let matrix = uniform_grid(5, 5);
        let path = search(pos(2, 2), pos(3, 2), &matrix, zero_heuristic)
            .expect("un chemin doit exister");
        assert_eq!(path.len(), 2);
        assert_eq!(path[0], pos(2, 2));
        assert_eq!(path[1], pos(3, 2));
    }

    #[test]
    fn path_blocked_returns_none() {
        let mut matrix = uniform_grid(5, 5);
        for row in matrix.iter_mut() {
            row[3] = 0;
        }
        assert!(search(pos(1, 2), pos(4, 2), &matrix, zero_heuristic).is_none());
    }

    #[test]
    fn path_avoids_obstacle() {
        let mut matrix = uniform_grid(5, 5);
        matrix[2][3] = 0;
        let path = search(pos(2, 2), pos(4, 2), &matrix, zero_heuristic)
            .expect("un chemin doit exister");
        assert!(!path.contains(&pos(3, 2)));
        assert_eq!(path[0], pos(2, 2));
        assert_eq!(*path.last().unwrap(), pos(4, 2));
    }

    #[test]
    fn path_starts_and_ends_correctly() {
        let matrix = uniform_grid(10, 10);
        let path = search(pos(1, 1), pos(7, 5), &matrix, zero_heuristic)
            .expect("un chemin doit exister");
        assert_eq!(path[0], pos(1, 1));
        assert_eq!(*path.last().unwrap(), pos(7, 5));
    }

    #[test]
    fn no_out_of_bounds_on_corner() {
        let matrix = uniform_grid(5, 5);
        let result = search(pos(0, 0), pos(4, 4), &matrix, zero_heuristic);
        assert!(result.is_some());
    }

    // --- Tests hex_distance ---

    #[test]
    fn hex_distance_same_position() {
        assert_eq!(hex_distance(pos(3, 3), pos(3, 3)), 0);
    }

    #[test]
    fn hex_distance_direct_neighbours() {
        // Chaque voisin direct doit être à distance 1.
        // Directions : (0,-1),(1,0),(-1,1),(1,1),(0,1),(-1,0)
        let center = pos(3, 3);
        let neighbours = [pos(3,2), pos(4,3), pos(2,4), pos(4,4), pos(3,4), pos(2,3)];
        for n in neighbours {
            assert_eq!(hex_distance(center, n), 1, "distance vers {:?} devrait être 1", n);
        }
    }

    #[test]
    fn hex_distance_no_underflow_when_b_greater() {
        // Vérifie qu'on n'a pas de panic quand b > a (le bug original).
        let d = hex_distance(pos(1, 1), pos(7, 5));
        assert!(d > 0);
    }

    // --- Tests search avec hex_distance comme heuristique ---

    #[test]
    fn search_hex_heuristic_finds_path() {
        let matrix = uniform_grid(10, 10);
        let path = search(pos(1, 1), pos(7, 5), &matrix, hex_distance)
            .expect("un chemin doit exister");
        assert_eq!(path[0], pos(1, 1));
        assert_eq!(*path.last().unwrap(), pos(7, 5));
    }

    #[test]
    fn search_hex_heuristic_same_cost_as_dijkstra() {
        // Une heuristique admissible doit donner un chemin de coût optimal,
        // donc de même longueur que Dijkstra (zero_heuristic) sur grille uniforme.
        let matrix = uniform_grid(10, 10);
        let start = pos(1, 1);
        let goal = pos(7, 5);
        let path_dijkstra = search(start, goal, &matrix, zero_heuristic).unwrap();
        let path_astar = search(start, goal, &matrix, hex_distance).unwrap();
        assert_eq!(path_dijkstra.len(), path_astar.len());
    }

    #[test]
    fn search_hex_heuristic_blocked_returns_none() {
        let mut matrix = uniform_grid(5, 5);
        for row in matrix.iter_mut() {
            row[3] = 0;
        }
        assert!(search(pos(1, 2), pos(4, 2), &matrix, hex_distance).is_none());
    }

    #[test]
    fn path_consecutive_positions_are_neighbours() {
        // Chaque étape du chemin doit être un voisin hexagonal valide.
        let matrix = uniform_grid(8, 8);
        let path = search(pos(1, 1), pos(6, 5), &matrix, zero_heuristic)
            .expect("un chemin doit exister");
        for window in path.windows(2) {
            let dx = window[1].x as i32 - window[0].x as i32;
            let dy = window[1].y as i32 - window[0].y as i32;
            let valid_moves: [(i32, i32); 6] = [(0,-1),(1,0),(-1,1),(1,1),(0,1),(-1,0)];
            assert!(valid_moves.contains(&(dx, dy)), "pas invalide: ({dx},{dy})");
        }
    }
}