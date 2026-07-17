use crate::states::GameState;
use crate::services::loot::Looting;
use crate::events::Event;

pub struct GatherSystem {}


impl GatherSystem {
    pub fn new() -> Self {Self {}}
    pub fn execute(&self, states: &mut GameState) -> Vec<Event>{
        let resources = Looting::generate(states.player.location);

        states.inventory.player.add_multi(resources);
        vec![Event::InventoryUpdated { changes: states.inventory.player.to_view() }]
    }
}