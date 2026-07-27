use std::collections::HashMap;
use rand::random;
use crate::definitions::resources::{LootEntry, Resource};

pub struct Looting {}


impl Looting{
    pub fn generate(loot: &[LootEntry]) -> HashMap<Resource, u32>{
        let mut qt_resources : HashMap<Resource, u32> = HashMap::new();

        for entry in loot{
            let gain = entry.infallible + (entry.infallible..entry.bonus_max)
                .filter(|_| { entry.chance > random()})
                .count() as u32;

            *qt_resources
                .entry(entry.resource)
                .or_insert(0) += gain
        }

        qt_resources
    }
}