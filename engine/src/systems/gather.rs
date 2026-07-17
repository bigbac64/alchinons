use crate::states::GameState;
use crate::services::loot::Looting;
use crate::events::Event;

pub struct GatherSystem {}


impl GatherSystem {
    pub fn new() -> Self {Self {}}
    pub fn execute(&self, states: &mut GameState) -> Vec<Event>{
        let terrain = states.map.get_terrain(states.player.player.position);
        let resources = Looting::generate(terrain);

        states.inventory.player.add_multi(resources);
        
        vec![Event::InventoryUpdated { changes: states.inventory.player.to_view() }]
    }
}