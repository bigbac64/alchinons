
pub mod inventory;
pub mod player;


pub struct GameState {
    pub(crate) inventory: inventory::InventoryState,
    pub(crate) player: player::PlayerState
}

impl GameState {
    pub fn new() -> Self {
        Self {
            inventory: inventory::InventoryState::new(),
            player: player::PlayerState::new(),
        }
    }
}