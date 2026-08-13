pub mod outcome;

use log::error;
use serde::Deserialize;
use crate::commands::outcome::Outcome;
use crate::craft::command::{CraftPayload, GetRecipesPayload};
use crate::gather::command::{GatherPayload, GatherSelectPayload};
use crate::inventory::command::{GetInventoryPayload, TransferInventoryPayload};
use crate::movement::command::MovePayload;
use crate::player::command::GetPlayerPayload;
use crate::progression::command::{GetProgressionPayload, PurchasePayload};
use crate::state::GameState;
use crate::world::command::{ExploitablePayload, ExploitablePlayerPositionPayload, GetMapPayload, GetTerrainPayload};

/// Marqueur : nom du point d'entrée Tauri unique (`invoke(NAME, {command})`).
/// N'est pas consommé par `generate_handler!` (qui a besoin d'un identifiant
/// de fonction, pas d'une constante) — sert de référence documentée pour
/// garder le nom de la fonction tauri::command et le nom JS synchronisés.
pub trait EngineCommand {
    const NAME: &'static str;
}

/// Un payload de `Command` sait s'exécuter seul contre le `GameState` — c'est
/// ce trait qui permet à `Command::execute` de rediriger chaque variante vers
/// son domaine sans connaître la logique qu'elle porte (cf. ARCHITECTURE_GUIDELINES §2.5/§2.9).
/// `self` est pris par valeur : une `Command` est consommée une seule fois,
/// jamais réutilisée après exécution.
pub trait StructCommand {
    fn execute(self, states: &mut GameState) -> Outcome;
}

/// Payload vide de `Command::ResetSave`. N'implémente pas `StructCommand` : cette
/// commande a besoin de `save_path`, que seul `GameEngine` possède (cf. §2.9) —
/// elle reste toujours une variante tuple pour la même raison que les autres
/// (uniformité : faire évoluer `ResetSave` avec des données plus tard n'impose
/// pas de changer sa forme, seulement d'ajouter des champs à ce struct).
#[derive(Deserialize)]
pub struct ResetSavePayload;


#[derive(Deserialize)]
pub enum Command {
    ExploitablePlayerPosition(ExploitablePlayerPositionPayload),
    Exploitable(ExploitablePayload),
    Gather(GatherPayload),
    GatherSelect(GatherSelectPayload),
    Move(MovePayload),
    TransferInventory(TransferInventoryPayload),
    Craft(CraftPayload),
    Purchase(PurchasePayload),

    /// Getter
    GetMap(GetMapPayload),
    GetTerrain(GetTerrainPayload),
    GetRecipes(GetRecipesPayload),
    GetPlayer(GetPlayerPayload),
    GetInventory(GetInventoryPayload),
    GetProgression(GetProgressionPayload),
    ResetSave(ResetSavePayload),
}

impl Command {
    /// Route chaque variante vers son domaine. Ajouter une commande ne touche
    /// jamais `engine.rs` : ce `match` est le seul point qui en a besoin, et
    /// il reste exhaustif (vérifié par le compilateur) — l'oubli d'un nouveau
    /// variant ne compile pas. Toutes les variantes portent un payload — même
    /// vide aujourd'hui (`GatherPayload`, `GetMapPayload`...) — pour que leur
    /// faire porter des données plus tard n'impose jamais de changer leur forme
    /// (cf. §2.9).
    ///
    /// `ResetSave` n'est volontairement *pas* géré ici : c'est une opération
    /// de persistance qui a besoin du `save_path` que seul `GameEngine`
    /// possède, pas juste du `GameState`. `GameEngine::execute` l'intercepte
    /// avant d'appeler cette fonction ; l'arm ci-dessous n'est qu'un filet de
    /// sécurité si cette invariant venait à être cassée par erreur.
    pub fn execute(self, states: &mut GameState) -> Outcome {
        match self {
            Command::ExploitablePlayerPosition(payload) => payload.execute(states),
            Command::Exploitable(payload) => payload.execute(states),
            Command::Gather(payload) => payload.execute(states),
            Command::GatherSelect(payload) => payload.execute(states),
            Command::Move(payload) => payload.execute(states),
            Command::TransferInventory(payload) => payload.execute(states),
            Command::Craft(payload) => payload.execute(states),
            Command::Purchase(payload) => payload.execute(states),
            Command::GetMap(payload) => payload.execute(states),
            Command::GetTerrain(payload) => payload.execute(states),
            Command::GetRecipes(payload) => payload.execute(states),
            Command::GetPlayer(payload) => payload.execute(states),
            Command::GetInventory(payload) => payload.execute(states),
            Command::GetProgression(payload) => payload.execute(states),
            Command::ResetSave(_) => {
                error!("ResetSave doit être intercepté par GameEngine::execute avant Command::execute");
                Outcome::none()
            }
        }
    }
}


impl EngineCommand for Command {
    const NAME: &'static str = "engine";
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verrou de contrat de fil : chaque variante ci-dessous est un newtype
    /// (`Command::X(payload)`), donc sa forme JSON est `{"X": <payload>}` — sans
    /// niveau d'imbrication `payload` supplémentaire. `src/api/engine.js` doit
    /// envoyer exactement ces formes.
    #[test]
    fn unit_payload_deserializes_from_null() {
        assert!(serde_json::from_str::<Command>(r#"{"Gather": null}"#).is_ok());
        assert!(serde_json::from_str::<Command>(r#"{"GetMap": null}"#).is_ok());
        assert!(serde_json::from_str::<Command>(r#"{"ResetSave": null}"#).is_ok());
        assert!(serde_json::from_str::<Command>(r#""Gather""#).is_err());
    }

    #[test]
    fn data_payload_deserializes_flat_without_payload_key() {
        assert!(serde_json::from_str::<Command>(r#"{"Craft": {"recipe": "Plank", "inventory": "player"}}"#).is_ok());
        assert!(serde_json::from_str::<Command>(r#"{"Craft": {"payload": {"recipe": "Plank", "inventory": "player"}}}"#).is_err());
    }
}
