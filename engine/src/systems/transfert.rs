use crate::definitions::inventory::Inventory;
use crate::events::Event;
use crate::states::GameState;
use crate::views::inventory::{InventoryView, ItemView};

pub struct TransferInventorySystem {}


impl TransferInventorySystem {
    pub fn new() -> Self { Self {} }

    pub fn execute(&mut self, source: InventoryView, destination: InventoryView, states: &mut GameState) -> Vec<Event>{
        let mut events = vec![];
        let source = Inventory::from_view(source);
        events.extend(match states.inventory.get_by_name_mut(source.name.as_str()) {
            Some(source_inventory) => {
                source_inventory.excludes(source.clone());
                vec![Event::InventoryUpdated {changes: source_inventory.to_view()}]
            },
            None => vec![]
        });

        events.extend(match states.inventory.get_by_name_mut(destination.name.as_str()) {
            Some(destination_inventory) => {
                destination_inventory.merge(source.clone());
                vec![Event::InventoryUpdated {changes: destination_inventory.to_view()}]
            },
            None => vec![]
        });

        events
    }
}