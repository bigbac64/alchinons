use std::collections::HashMap;
use crate::resource::Resource;
use crate::state::GameState;
use crate::gather::utils::loot::Looting;
use crate::gather::view::GatherOptionView;
use crate::events::Event;
use crate::world::system::TileSystem;

pub struct GatherSystem {}

impl GatherSystem {
    pub fn new() -> Self {Self {}}

    /// Tire les ressources disponibles sur la tile courante du joueur et les propose
    /// à la sélection (voir `GatherState::propose`) — rien n'est ajouté à l'inventaire
    /// tant que `select` n'a pas été appelé avec l'une des ressources proposées.
    pub fn propose(&self, states: &mut GameState) -> Vec<GatherOptionView> {
        let loot = states.world.map.get_tile(states.player.player.position)
            .map(|tile| tile.loot_pool())
            .unwrap_or_default();

        let options = if TileSystem::exploitable_player_position(states) {
                Looting::generate(&loot)
            } else {
                HashMap::new()
            };

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
                TileSystem::exploit_player_position(states); // TODO si exploitable is false donc options de gather = 0 coté front dire est ya plus c'est a sec
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
