use serde::Serialize;
use serde_json::{json, Value};
use crate::views::inventory::InventoryView;

pub mod inventory;

#[derive(Serialize)]
pub enum Event {
    InventoryUpdated { changes: InventoryView }
}

impl Event {
    pub fn name(&self) -> &'static str{
        match self {
            Event::InventoryUpdated {changes: _} => "inventory_update",
        }
    }

    pub fn payload(&self) -> Value {
        match self {
            Event::InventoryUpdated {changes} => json!(changes)
        }
    }
}

