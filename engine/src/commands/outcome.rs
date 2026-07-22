use serde::Serialize;
use crate::definitions::position::Position;
use crate::events::Event;
use crate::views::inventory::InventoryView;
use crate::views::map::MapView;
use crate::views::terrain::TerrainView;
use crate::views::recipe::RecipeView;

#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
pub enum CommandOutput {
    Map(MapView),
    Inventory(InventoryView),
    Terrain(TerrainView),
    Recipes(RecipeView),
    Player(Position),
    None,
}

pub struct SystemOutcome {
    pub output: CommandOutput,
    pub events: Vec<Event>,
}

impl SystemOutcome {
    pub fn output(output: CommandOutput) -> Self {
        Self { output, events: vec![] }
    }
    pub fn events(events: Vec<Event>) -> Self {
        Self { output: CommandOutput::None, events }
    }
    pub fn both(output: CommandOutput, events: Vec<Event>) -> Self {
        Self { output, events }
    }
}