use std::collections::HashMap;
use serde::Serialize;
use crate::definitions::resources::{LootEntry, Resource};
use crate::views::terrain::{TerrainDefinitionView, TerrainView};

const VOID: TerrainDefinition = TerrainDefinition {
    walkable: false,
    movement_cost: 0,
    loot: &[],
    label: "Vide",
    color: "#12172a",
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
    label: "Plaine",
    color: "#4f7a34",
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
    label: "Forêt",
    color: "#2c5c30",
};

const WATER: TerrainDefinition = TerrainDefinition {
    walkable: false,
    movement_cost: 3,
    loot: &[],
    label: "Eau",
    color: "#2f4a7a",
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
    label: "Falaise",
    color: "#3a2a1d",
};

const CAMP: TerrainDefinition = TerrainDefinition {
    walkable: true,
    movement_cost: 1,
    loot: &[],
    label: "Campement",
    color: "#8a6a4f",
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

    pub fn view() -> TerrainView {
        TerrainView {
            terrain: HashMap::from([
                ("void".to_string(), VOID.to_view()),
                ("camp".to_string(), CAMP.to_view()),
                ("plain".to_string(), PLAIN.to_view()),
                ("forest".to_string(), FOREST.to_view()),
                ("water".to_string(), WATER.to_view()),
                ("cliff".to_string(), CLIFF.to_view()),
            ])
        }
    }
}

#[derive(Serialize)]
pub struct TerrainDefinition {
    pub walkable: bool,
    pub movement_cost: u32,
    pub loot: &'static [LootEntry],
    pub label: &'static str,
    pub color: &'static str,
}

impl TerrainDefinition {
    pub fn to_view(&self) -> TerrainDefinitionView {
        TerrainDefinitionView {
            walkable: self.walkable,
            cost: self.movement_cost,
            label: self.label.to_string(),
            color: self.color.to_string(),
        }
    }
}