pub mod outcome;

use serde::Deserialize;
use crate::inventory::command::TransferInventoryPayload;
use crate::craft::command::CraftPayload;
use crate::position::Position;
use crate::progression::command::PurchasePayload;
use crate::resource::Resource;

/// Marqueur : nom du point d'entrée Tauri unique (`invoke(NAME, {command})`).
/// N'est pas consommé par `generate_handler!` (qui a besoin d'un identifiant
/// de fonction, pas d'une constante) — sert de référence documentée pour
/// garder le nom de la fonction tauri::command et le nom JS synchronisés.
pub trait EngineCommand {
    const NAME: &'static str;
}


#[derive(Deserialize)]
pub enum Command {
    ExploitablePlayerPosition,
    Exploitable {
        position: Position
    },
    Gather,
    GatherSelect {
        resource: Resource,
    },
    Move {
        position: Position
    },
    TransferInventory {
        payload: TransferInventoryPayload,
    },
    Craft {
        payload: CraftPayload,
    },
    Purchase {
        payload: PurchasePayload,
    },

    /// Getter
    GetMap,
    GetTerrain,
    GetRecipes,
    GetPlayer,
    GetInventory {
        name: String,
    },
    GetProgression,
    ResetSave,
}


impl EngineCommand for Command {
    const NAME: &'static str = "engine";
}
