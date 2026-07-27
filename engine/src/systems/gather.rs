use crate::definitions::position::Position;
use crate::states::GameState;
use crate::services::loot::Looting;
use crate::events::Event;

pub struct GatherSystem {}


impl GatherSystem {
    pub fn new() -> Self {Self {}}

    /// `clicked` est le point cliqué dans le repère local de la tile (0..400).
    pub fn execute(&self, clicked: Position, states: &mut GameState) -> Vec<Event>{
        match states.map.get_tile(states.player.player.position) {
            Some(tile) => {
                // dernière area (la plus "au dessus" visuellement) dont la hitbox contient le clic
                let loot = tile.areas.iter().rev()
                    .find(|area| area.contains(clicked))
                    .map(|area| area.loot())
                    .unwrap_or(&[]);

                let resources = Looting::generate(loot);

                states.inventory.player.add_multi(resources);

                vec![Event::InventoryUpdated { changes: states.inventory.player.to_view() }]
            },
            None => vec![], // Event error ?
        }
    }
}