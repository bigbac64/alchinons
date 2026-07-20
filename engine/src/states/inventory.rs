use crate::definitions::inventory::Inventory;


pub struct InventoryState{
    pub(crate) player: Inventory,
    pub(crate) warehouse: Inventory
}

impl InventoryState {
    pub fn new() -> Self {
        Self {
            player: Inventory::new(String::from("player")),
            warehouse: Inventory::new(String::from("warehouse")),
        }
    }
    
    pub fn get_by_name(&self, name: &str) -> Option<&Inventory>{
        match name {
            "player" => Some(&self.player),
            "warehouse" => Some(&self.warehouse),
            _ => None
        }
    }

    pub fn get_by_name_mut(&mut self, name: &str) -> Option<&mut Inventory>{
        match name {
            "player" => Some(&mut self.player),
            "warehouse" => Some(&mut self.warehouse),
            _ => None
        }
    }
}