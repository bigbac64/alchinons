use serde::Serialize;
use serde_json::{json, Value};
use crate::definitions::position::Position;
use crate::views::inventory::InventoryView;

pub mod inventory;

#[derive(Serialize, Clone, Debug)]
#[serde(tag = "type", content = "data")]
pub enum Event {
    InventoryUpdated { changes: InventoryView },
    MovePath {path: Vec<Position>},
    MoveFailed,
}

/// Marqueur : un type d'event diffusable au frontend via un canal Tauri unique.
/// Centralise le nom du canal pour ne jamais le retaper en dur (ni dans lib.rs,
/// ni côté front) — pur marqueur de données, aucune logique, conforme à
/// "Events are pure data".
pub trait EngineBroadcast: Serialize {
    const CHANNEL: &'static str;
}

impl Event {
    pub fn name(&self) -> &'static str{
        match self {
            Event::InventoryUpdated {changes: _} => "inventory_update",
            Event::MovePath {path: _} => "move_path",
            Event::MoveFailed => "move_failed",
        }
    }

    pub fn payload(&self) -> Value {
        match self {
            Event::InventoryUpdated {changes} => { json!(changes) },
            Event::MovePath {path} => json!(path),
            Event::MoveFailed => json!({"error": "Pathfinding failed"}),
        }
    }
}

impl EngineBroadcast for Event {
    const CHANNEL: &'static str = "engine://event";
}
