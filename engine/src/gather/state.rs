use std::collections::HashMap;
use crate::resource::Resource;

/// État transitoire d'une fouille en cours : les options proposées par le dernier
/// `Command::Gather`/`Command::GatherSelect`, en attente que le joueur en choisisse
/// une (voir `gather::system::GatherSystem`). Une seule offre à la fois — en
/// proposer une nouvelle remplace l'ancienne.
pub struct GatherState {
    pending: Option<HashMap<Resource, u32>>,
}

impl GatherState {
    pub fn new() -> Self {
        Self { pending: None }
    }

    pub fn propose(&mut self, options: HashMap<Resource, u32>) {
        self.pending = Some(options);
    }

    /// Retire l'offre en cours et retourne la quantité proposée pour `resource`, si elle
    /// en faisait partie. Consomme toute l'offre dans tous les cas : les ressources non
    /// choisies sont perdues, et une offre invalide/expirée ne peut pas être retentée.
    pub fn resolve(&mut self, resource: Resource) -> Option<u32> {
        self.pending.take()?.get(&resource).copied()
    }
}
