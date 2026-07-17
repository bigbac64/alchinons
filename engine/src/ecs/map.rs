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

    pub fn from_array<const H: usize, const W: usize>(array: &[&[Terrain; H]; W])  -> Self {
        Self {
            map: array.iter()
                .map(|row| row.iter()
                    .map(|&cell| cell).collect())
                .collect()
        }
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