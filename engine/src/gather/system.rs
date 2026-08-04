use std::collections::HashMap;
use crate::resource::Resource;
use crate::state::GameState;
use crate::gather::utils::loot::Looting;
use crate::gather::view::GatherOptionView;
use crate::events::Event;

pub struct GatherSystem {}

impl GatherSystem {
    pub fn new() -> Self {Self {}}

    /// Tire les ressources disponibles sur la tile courante du joueur et les propose
    /// à la sélection (voir `GatherState::propose`) — rien n'est ajouté à l'inventaire
    /// tant que `select` n'a pas été appelé avec l'une des ressources proposées.
    pub fn propose(&self, states: &mut GameState) -> Vec<GatherOptionView> {
        let loot = states.map.get_tile(states.player.player.position)
            .map(|tile| tile.loot_pool())
            .unwrap_or_default();

        let options = Looting::generate(&loot);
        states.gather.propose(options.clone());

        Self::to_view(options)
    }

    /// Valide `resource` contre la dernière offre proposée : si elle en faisait partie,
    /// l'ajoute à l'inventaire du joueur. Reformule ensuite immédiatement une nouvelle
    /// proposition dans tous les cas (boucle de fouille continue, cf. Exploitation.jsx).
    pub fn select(&self, resource: Resource, states: &mut GameState) -> (Vec<GatherOptionView>, Vec<Event>) {
        let events = match states.gather.resolve(resource) {
            Some(amount) => {
                states.inventory.player.add(resource, amount);
                vec![Event::InventoryUpdated { changes: states.inventory.player.to_view() }]
            },
            None => vec![],
        };

        (self.propose(states), events)
    }

    fn to_view(options: HashMap<Resource, u32>) -> Vec<GatherOptionView> {
        options.into_iter()
            .filter(|(_, amount)| *amount > 0)
            .map(|(resource, amount)| GatherOptionView { resource, amount })
            .collect()
    }
}
