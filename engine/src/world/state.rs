use serde::{Deserialize, Serialize};
use crate::utils::countdown::{Countdown};
use crate::world::layout::MAP_LAYOUT;
use crate::world::map::Map;

const LIMIT_COUNTER: usize = 5;


#[derive(Serialize, Deserialize, Clone)]
pub struct WorldState {
    pub(crate) map: Map,
    pub(crate) tiles: Vec<Vec<Countdown>>,
}

impl Default for WorldState {
    fn default() -> Self {Self::new()}
}


impl WorldState {
    pub fn new() -> Self {

        Self {
            map: Map::from_array(&MAP_LAYOUT),
            tiles: MAP_LAYOUT.iter()
                .map(|_row| _row.iter()
                    .map(|&_| Countdown::new(LIMIT_COUNTER)).collect())
                .collect()
        }
    }
}