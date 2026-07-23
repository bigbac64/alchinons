use std::cmp;
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

    pub fn has_all(&self, required: &HashMap<Resource, u32>) -> bool {
        required.iter().all(|(resource, quantity)| {
            self.content.get(resource).copied().unwrap_or(0) >= *quantity
        })
    }

    pub fn excludes(&mut self, other: HashMap<Resource, u32>) -> Option<HashMap<Resource, u32>> {
        let mut had_overflow = false;
        let mut actually_excluded: HashMap<Resource, u32> = HashMap::new();

        for (key, value) in other {
            let entry = self.content.entry(key.clone()).or_insert(0);
            let current = *entry;
            match current.checked_sub(value) {
                Some(new_val) => {
                    *entry = new_val;
                    actually_excluded.insert(key, value);
                }
                None => {
                    had_overflow = true;
                    *entry = 0;
                    actually_excluded.insert(key, current);
                }
            }

            // on fais disparaiter
            if *entry == 0 {
                self.content.remove(&key);
            }
        }

        if had_overflow { Some(actually_excluded) } else { None }
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