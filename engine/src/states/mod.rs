use crate::definitions::map::MAP_LAYOUT;
use crate::ecs;

pub mod inventory;
pub mod player;


pub struct GameState {
    pub(crate) inventory: inventory::InventoryState,
    pub(crate) player: player::PlayerState,
    pub(crate) map: ecs::map::Map
}

impl GameState {
    pub fn new() -> Self {
        Self {
            inventory: inventory::InventoryState::new(),
            player: player::PlayerState::new(),
            map: ecs::map::Map::from_array::<11, 10>(&MAP_LAYOUT),
        }
    }
}