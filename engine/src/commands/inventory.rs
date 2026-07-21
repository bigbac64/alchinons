use std::collections::HashMap;
use serde::Deserialize;
use crate::definitions::resources::Resource;

#[derive(Deserialize)]
pub struct TransferInventoryPayload {
    pub source: String,
    pub destination: String,
    pub items: HashMap<Resource, u32>,
}