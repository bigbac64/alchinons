use serde::Serialize;
use crate::definitions::resources::Resource;

#[derive(Serialize)]
pub struct ItemView {
    pub(crate) name: Resource,
    pub(crate) quantity: u32,
}

#[derive(Serialize)]
pub struct InventoryView {
    pub(crate) items: Vec<ItemView>
}