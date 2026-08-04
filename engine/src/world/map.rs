use crate::position::{hex_distance, Position};
use crate::world::tile::Tile;
use crate::world::terrain::Terrain;
use crate::world::view::MapView;

pub struct Map {
    map: Vec<Vec<Terrain>>,
    tiles: Vec<Vec<&'static Tile>>,
    explored: Vec<Vec<bool>>,
}

impl Map {
    pub fn new() -> Self {
        Self {
            map: vec![vec![Terrain::Void]],
            tiles: vec![vec![Self::pick_tile(Terrain::Void)]],
            explored: vec![vec![true]],
        }
    }

    pub fn from_array<const ROWS: usize, const COLS: usize>(array: &[[Terrain; COLS]; ROWS]) -> Self {
        let map: Vec<Vec<Terrain>> = array.iter()
            .map(|row| row.iter()
                .map(|&cell| cell).collect())
            .collect();

        // Tirage figé une seule fois ici : chaque case garde ensuite la même Tile
        // pour toute la durée de vie de cette Map (get_tile ne re-tire jamais).
        let tiles = map.iter()
            .map(|row| row.iter()
                .map(|&terrain| Self::pick_tile(terrain))
                .collect())
            .collect();

        let explored = vec![vec![false; COLS]; ROWS];

        let mut instance = Self { map, tiles, explored };

        // Brouillard initial : seul le camp (et son rayon direct) est visible au
        // démarrage — le reste se dévoile via `reveal`, dont le déclenchement en
        // cours de partie (ex. à chaque déplacement) reste à câbler plus tard.
        if let Some(camp) = instance.find_camp() {
            instance.reveal(camp, 1);
        }

        instance
    }

    fn find_camp(&self) -> Option<Position> {
        self.map.iter().enumerate()
            .find_map(|(y, row)| row.iter().enumerate()
                .find_map(|(x, &terrain)| matches!(terrain, Terrain::Camp)
                    .then(|| Position { x: x as u32, y: y as u32 })))
    }

    /// Dévoile la carte autour d'une position sur un rayon donné (distance
    /// hexagonale, cases incluses). Purement additif : une case déjà explorée
    /// ne redevient jamais brouillard.
    pub fn reveal(&mut self, center: Position, radius: u32) {
        for (y, row) in self.explored.iter_mut().enumerate() {
            for (x, cell) in row.iter_mut().enumerate() {
                let position = Position { x: x as u32, y: y as u32 };
                if hex_distance(center, position) <= radius {
                    *cell = true;
                }
            }
        }
    }

    fn pick_tile(terrain: Terrain) -> &'static Tile {
        let pool = Tile::pool(terrain);
        pool[rand::random_range(0..pool.len())]
    }

    pub fn matrix_cost(&self) -> Vec<Vec<u32>> {
        self.map.iter()
            .map(|row| row.iter()
                .map(|&cell| {
                    let def = cell.definition();
                    if def.walkable {
                        def.movement_cost
                    } else {
                        0
                    }
                })
                .collect())
            .collect()
    }

    pub fn get_terrain(&self, position: Position) -> Option<Terrain> {
        self.map.get(position.y as usize)?.get(position.x as usize).copied()
    }

    pub fn get_tile(&self, position: Position) -> Option<&'static Tile> {
        self.tiles.get(position.y as usize)?.get(position.x as usize).copied()
    }

    pub fn to_view(&self) -> MapView {
        MapView {
            map: self.map.iter()
                .map(|row| row.iter()
                    .copied()
                    .map(|cell| format!("{:?}", cell).to_lowercase())
                    .collect()).
                collect(),
            explored: self.explored.clone(),
        }
    }
}