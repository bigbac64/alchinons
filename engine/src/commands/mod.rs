pub mod inventory_transfer;

use serde::{Deserialize, Serialize};
use crate::commands::inventory_transfer::TransferInventoryPayload;
use crate::definitions::position::Position;
use crate::events::Event;
use crate::views::inventory::InventoryView;
use crate::views::map::MapView;
use crate::views::terrain::TerrainView;


/// Marqueur : nom du point d'entrée Tauri unique (`invoke(NAME, {command})`).
/// N'est pas consommé par `generate_handler!` (qui a besoin d'un identifiant
/// de fonction, pas d'une constante) — sert de référence documentée pour
/// garder le nom de la fonction tauri::command et le nom JS synchronisés.
pub trait EngineCommand {
    const NAME: &'static str;
}


#[derive(Deserialize)]
pub enum Command {
    Gather,
    Move {
        position: Position
    },
    TransferInventory {
        payload: TransferInventoryPayload,
    },

    /// Getter
    GetMap,
    GetTerrain,
    GetPlayer,
    GetInventory {
        name: String,
    },
}


impl EngineCommand for Command {
    const NAME: &'static str = "engine";
}



#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
pub enum CommandOutput {
    Map(MapView),
    Inventory(InventoryView),
    Terrain(TerrainView),
    Player(Position),
    None,
}

pub struct SystemOutcome {
    pub output: CommandOutput,
    pub events: Vec<Event>,
}

impl SystemOutcome {
    pub fn output(output: CommandOutput) -> Self {
        Self { output, events: vec![] }
    }
    pub fn events(events: Vec<Event>) -> Self {
        Self { output: CommandOutput::None, events }
    }
    pub fn both(output: CommandOutput, events: Vec<Event>) -> Self {
        Self { output, events }
    }
}