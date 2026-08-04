use serde::Serialize;
use crate::resource::Resource;

/// Une option de récolte proposée au joueur : la ressource et la quantité déjà tirées
/// aléatoirement (voir `gather::utils::loot::Looting::generate`), prêtes à être ajoutées
/// à l'inventaire si choisies via `Command::GatherSelect`.
#[derive(Serialize, Clone)]
pub struct GatherOptionView {
    pub resource: Resource,
    pub amount: u32,
}
