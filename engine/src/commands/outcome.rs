use serde::Serialize;
use crate::position::Position;
use crate::events::Event;
use crate::world::view::{MapView, TerrainView, TileView};
use crate::inventory::view::InventoryView;
use crate::craft::view::RecipeView;

#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
pub enum CommandOutput {
    Map(MapView),
    Inventory(InventoryView),
    Terrain(TerrainView),
    Recipes(RecipeView),
    Player(Position),
    Tile(TileView),
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