use crate::definitions::resources::{LootEntry, Resource};

const VOID: TerrainDefinition = TerrainDefinition {
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

const FOREST: TerrainDefinition = TerrainDefinition {
    walkable: true,
    movement_cost: 2,
    loot: &[LootEntry{
        resource: Resource::Wood,
        infallible: 3,
        bonus_max: 10,
        chance: 0.3,
    }],
};

const WATER: TerrainDefinition = TerrainDefinition {
    walkable: false,
    movement_cost: 3,
    loot: &[],
};

const CLIFF: TerrainDefinition = TerrainDefinition {
    walkable: true,
    movement_cost: 2,
    loot: &[LootEntry{
        resource: Resource::Stone,
        infallible: 1,
        bonus_max: 4,
        chance: 0.5,
    }],
};

const CAMP: TerrainDefinition = TerrainDefinition {
    walkable: true,
    movement_cost: 0,
    loot: &[],
};


#[derive(Copy, Clone, Debug)]
pub enum Terrain {
    Void,
    Camp,
    Plain,
    Forest,
    Water,
    Cliff,
}

impl Terrain {
    pub fn definition(&self) -> &'static TerrainDefinition{
        match self {
            Terrain::Void => &VOID,
            Terrain::Camp => &CAMP,
            Terrain::Plain => &PLAIN,
            Terrain::Forest => &FOREST,
            Terrain::Water => &WATER,
            Terrain::Cliff => &CLIFF,
        }
    }
}

pub struct TerrainDefinition {
    pub walkable: bool,
    pub movement_cost: u32,
    pub loot: &'static [LootEntry],
}