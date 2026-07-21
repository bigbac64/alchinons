pub mod inventory;
pub mod outcome;

use serde::Deserialize;
use crate::commands::inventory::TransferInventoryPayload;
use crate::definitions::position::Position;

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
