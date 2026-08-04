pub mod outcome;

use serde::Deserialize;
use crate::inventory::command::TransferInventoryPayload;
use crate::craft::command::CraftPayload;
use crate::position::Position;
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
    /// Tire les ressources disponibles sur la tile courante du joueur et les propose
    /// à la sélection — voir `gather::system::GatherSystem::propose`. Ne modifie pas
    /// l'inventaire : c'est `GatherSelect` qui valide un choix.
    Gather,
    /// Valide le choix du joueur parmi la dernière offre de `Gather`, l'ajoute à son
    /// inventaire si elle en faisait partie, puis reformule immédiatement une nouvelle
    /// proposition — voir `gather::system::GatherSystem::select`.
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

    /// Getter
    GetMap,
    GetTerrain,
    GetRecipes,
    GetPlayer,
    GetInventory {
        name: String,
    },
}


impl EngineCommand for Command {
    const NAME: &'static str = "engine";
}
