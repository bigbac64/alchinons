pub mod inventory;
pub mod outcome;
pub mod craft;

use serde::Deserialize;
use crate::commands::inventory::TransferInventoryPayload;
use crate::commands::craft::CraftPayload;
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
    /// `position` est le point cliqué dans le repère local de la tile (0..400,
    /// ancrage haut-gauche) — pas une case de la grille, contrairement à `Move`.
    Gather {
        position: Position,
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

    /// Getter
    GetMap,
    GetTerrain,
    GetTile {
        position: Position,
    },
    GetRecipes,
    GetPlayer,
    GetInventory {
        name: String,
    },
}


impl EngineCommand for Command {
    const NAME: &'static str = "engine";
}
