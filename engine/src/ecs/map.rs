use crate::definitions::area::Tile;
use crate::definitions::position::Position;
use crate::definitions::terrain::Terrain;
use crate::views::map::MapView;

pub struct Map {
    map: Vec<Vec<Terrain>>,
    tiles: Vec<Vec<&'static Tile>>,
}

impl Map {
    pub fn new() -> Self {
        Self {
            map: vec![vec![Terrain::Void]],
            tiles: vec![vec![Self::pick_tile(Terrain::Void)]],
        }
    }

    pub fn from_array<const H: usize, const W: usize>(array: &[[Terrain; 11]; 10]) -> Self {
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

        Self { map, tiles }
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
                collect()
        }
    }
}