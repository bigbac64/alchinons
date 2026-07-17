use serde::Serialize;
use serde_json::{json, Value};
use crate::definitions::position::Position;
use crate::views::inventory::InventoryView;

pub mod inventory;

#[derive(Serialize)]
pub enum Event {
    InventoryUpdated { changes: InventoryView },
    MovePath {path: Vec<Position>},
}

impl Event {
    pub fn name(&self) -> &'static str{
        match self {
            Event::InventoryUpdated {changes: _} => "inventory_update",
            Event::MovePath {path: _} => "move_path",
        }
    }

    pub fn payload(&self) -> Value {
        match self {
            Event::InventoryUpdated {changes} => json!(changes),
            Event::MovePath {path} => json!(path),
        }
    }
}

