use crate::craft::state::CraftState;
use crate::gather::state::GatherState;
use crate::inventory::state::InventoryState;
use crate::player::state::PlayerState;
use crate::progression::state::ProgressionState;
use crate::world::state::WorldState;

pub struct GameState {
    pub(crate) inventory: InventoryState,
    pub(crate) player: PlayerState,
    pub(crate) world: WorldState,
    pub(crate) craft: CraftState,
    pub(crate) gather: GatherState,
    pub(crate) progression: ProgressionState,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            inventory: InventoryState::new(),
            player: PlayerState::new(),
            world: WorldState::new(),
            craft: CraftState::new(),
            gather: GatherState::new(),
            progression: ProgressionState::new(),
        }
    }
}
