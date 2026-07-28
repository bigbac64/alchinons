use crate::craft::state::CraftState;
use crate::inventory::state::InventoryState;
use crate::player::state::PlayerState;
use crate::world::layout::MAP_LAYOUT;
use crate::world::map::Map;

pub struct GameState {
    pub(crate) inventory: InventoryState,
    pub(crate) player: PlayerState,
    pub(crate) map: Map,
    pub(crate) craft: CraftState,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            inventory: InventoryState::new(),
            player: PlayerState::new(),
            map: Map::from_array::<11, 10>(&MAP_LAYOUT),
            craft: CraftState::new(),
        }
    }
}
