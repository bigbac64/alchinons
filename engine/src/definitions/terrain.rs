use crate::definitions::resources::{LootEntry, Resource};

const NONE: TerrainDefinition = TerrainDefinition {
    walkable: false,
    movement_cost: 0,
    loot: &[],
};

const PLAIN: TerrainDefinition = TerrainDefinition {
    walkable: true,
    movement_cost: 1,
    loot: &[LootEntry{
        resource: Resource::Wood,
        infallible: 1,
        bonus_max: 5,
        chance: 0.3,
    }],
};

#[derive(Copy, Clone)]
pub enum Terrain {
    None,
    Plain,
}

impl Terrain {
    pub fn definition(&self) -> &'static TerrainDefinition{
        match self {
            Terrain::None => &NONE,
            Terrain::Plain => &PLAIN,
        }
    }
}

pub struct TerrainDefinition {
    pub walkable: bool,
    pub movement_cost: u32,
    pub loot: &'static [LootEntry],
}