use crate::definitions::inventory::Inventory;


pub struct InventoryState{
    pub(crate) player: Inventory // va devoir etre passé en inventory (definition)
}

impl InventoryState {
    pub fn new() -> Self {
        Self {
            player: Inventory::new(),
        }
    }
}