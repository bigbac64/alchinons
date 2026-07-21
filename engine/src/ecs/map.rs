use crate::definitions::position::Position;
use crate::definitions::terrain::Terrain;
use crate::views::map::MapView;

pub struct Map {
    map: Vec<Vec<Terrain>>
}

impl Map {
    pub fn new() -> Self {
        Self {
            map: vec![vec![Terrain::Void]]
        }
    }

    pub fn from_array<const H: usize, const W: usize>(array: &[[Terrain; 11]; 10]) -> Self {
        Self {
            map: array.iter()
                .map(|row| row.iter()
                    .map(|&cell| cell).collect())
                .collect()
        }
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
        if self.map.capacity() < position.y as usize
            || self.map[position.y as usize].capacity() < position.x as usize {
            return None;
        }
        Some(self.map[position.y as usize][position.x as usize])
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