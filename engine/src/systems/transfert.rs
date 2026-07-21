use std::collections::HashMap;
use crate::definitions::inventory::Inventory;
use crate::definitions::resources::Resource;
use crate::events::Event;
use crate::states::GameState;
use crate::views::inventory::{InventoryView, ItemView};

pub struct TransferInventorySystem {}


impl TransferInventorySystem {
    pub fn new() -> Self { Self {} }

    pub fn execute(&mut self, source: String, destination: String, items: HashMap<Resource, u32>, states: &mut GameState) -> Vec<Event>{
        let mut events = vec![];
        let mut real_exclude: Option<HashMap<Resource, u32>> = None;
        
        events.extend(match states.inventory.get_by_name_mut(source.as_str()) {
            Some(source_inventory) => {
                real_exclude = source_inventory.excludes(items.clone());
                vec![Event::InventoryUpdated {changes: source_inventory.to_view()}]
            },
            None => vec![]
        });

        events.extend(match states.inventory.get_by_name_mut(destination.as_str()) {
            Some(destination_inventory) => {
                match real_exclude {
                    Some(real_exclude) => {
                        destination_inventory.add_multi(real_exclude);
                    },
                    None => {
                        destination_inventory.excludes(items.clone());
                    }
                }

                vec![Event::InventoryUpdated {changes: destination_inventory.to_view()}]
            },
            None => vec![]
        });

        events
    }
}