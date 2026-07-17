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
                .map(|&cell| cell.definition().movement_cost)
                .collect())
            .collect()
    }
    
    pub fn get_terrain(&self, position: Position) -> Terrain {
        self.map[position.y as usize][position.x as usize]
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