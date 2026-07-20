use serde::{Deserialize, Serialize};

#[derive(Eq, Hash, PartialEq, Copy, Clone, Debug, Serialize, Deserialize)]
pub enum Resource {
    Wood,
    Stone,
}


#[derive(Serialize)]
pub struct LootEntry {
    pub resource: Resource,
    pub infallible: u32,
    pub bonus_max: u32,   // bonus = la quantité maximal obtenable
    pub chance: f32,      // chance = ratio de reussite a chaque unité de bonus
}