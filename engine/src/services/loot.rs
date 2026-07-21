use std::collections::HashMap;
use rand::random;
use crate::definitions::resources::Resource;
use crate::definitions::terrain::Terrain;

pub struct Looting {}


impl Looting{
    pub fn generate(terrain: Terrain) -> HashMap<Resource, u32>{
        let definition = terrain.definition();
        let mut qt_resources : HashMap<Resource, u32> = HashMap::new();

        for loot in definition.loot{
            let gain = loot.infallible + (loot.infallible..loot.bonus_max)
                .filter(|_| { loot.chance > random()})
                .count() as u32;

            *qt_resources
                .entry(loot.resource)
                .or_insert(0) += gain
        }

        qt_resources
    }
}