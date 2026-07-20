use std::collections::HashMap;
use crate::definitions::resources::Resource;
use crate::views::inventory::{InventoryView, ItemView};

#[derive(Debug, Clone)]
pub struct Inventory {
    pub(crate) name: String,
    content: HashMap<Resource, u32>
}

impl Inventory {
    pub fn new(name: String) -> Self {
        Self {
            name,
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

    pub fn merge(&mut self, other: Inventory) {
        for (key, value) in other.content {
            self.add(key, value)
        }
    }

    pub fn excludes(&mut self, other: Inventory) {
        for (key, value) in other.content {
            self.content.entry(key).and_modify(|v| *v = v.checked_sub(value).unwrap_or(0)).or_insert(0);
        }
    }

    pub fn from_view(_view: InventoryView) -> Self {
        Self {
            name: _view.name,
            content: _view.items.iter().map(|item| (
                item.name, item.quantity)
            ).collect()
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
            name: self.name.clone(),
            items
        }
    }
}