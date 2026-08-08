use crate::craft::state::CraftState;
use crate::gather::state::GatherState;
use crate::inventory::state::InventoryState;
use crate::player::state::PlayerState;
use crate::progression::state::ProgressionState;
use crate::world::layout::MAP_LAYOUT;
use crate::world::map::Map;

pub struct GameState {
    pub(crate) inventory: InventoryState,
    pub(crate) player: PlayerState,
    pub(crate) map: Map,
    pub(crate) craft: CraftState,
    pub(crate) gather: GatherState,
    pub(crate) progression: ProgressionState,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            inventory: InventoryState::new(),
            player: PlayerState::new(),
            map: Map::from_array(&MAP_LAYOUT),
            craft: CraftState::new(),
            gather: GatherState::new(),
            progression: ProgressionState::new(),
        }
    }
}
