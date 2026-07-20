use serde::{Deserialize, Serialize};
use crate::definitions::resources::Resource;

#[derive(Serialize, Deserialize, Debug)]
pub struct ItemView {
    pub(crate) name: Resource,
    pub(crate) quantity: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InventoryView {
    pub(crate) name: String,
    pub(crate) items: Vec<ItemView>
}