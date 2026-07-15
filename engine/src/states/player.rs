use crate::definitions::terrain::Terrain;


pub struct PlayerState {
    pub(crate) location: Terrain
}

impl PlayerState {
    pub fn new() -> Self {
        Self {
            location: Terrain::Plain
        }
    }
}