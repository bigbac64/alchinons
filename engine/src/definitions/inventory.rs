use std::collections::HashMap;
use crate::definitions::resources::Resource;
use crate::views::inventory::{InventoryView, ItemView};

pub struct Inventory {
    content: HashMap<Resource, u32>
}

impl Inventory {
    pub fn new() -> Self {
        Self {
            content: HashMap::new(),
        }
    }

    pub fn add(&mut self, resource: Resource, quantity: u32) {
        self.content.entry(resource).and_modify(|v| *v += quantity).or_insert(quantity);
    }

    pub fn add_multi(&mut self, resources: HashMap<Resource, u32>){
        for (key, value) in resources {
            self.add(key, value)
        }
    }

    pub fn to_view(&self) -> InventoryView {
        let mut items: Vec<ItemView> = Vec::new();
        for (key, qt) in self.content.clone() {
            items.push(ItemView {
                name: key,
                quantity: qt,
            })
        }

        InventoryView {
            items
        }
    }
}