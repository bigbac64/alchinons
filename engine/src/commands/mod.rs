use serde::{Deserialize, Serialize};
use crate::definitions::position::Position;
use crate::views::inventory::InventoryView;
use crate::views::map::MapView;
use crate::views::terrain::TerrainView;

#[derive(Deserialize)]
pub enum Command {
    Gather,
    Move {
        position: Position
    },
    TransferInventory {
        source: InventoryView,
        destination: InventoryView,
    },

    /// Getter
    GetMap,
    GetTerrain,
    GetInventory {
        name: String,
    },
}


#[derive(Serialize)] 
#[serde(tag = "type", content = "data")]
pub enum CommandOutput {
    Map(MapView),
    Inventory(InventoryView),
    Terrain(TerrainView),
    None,
}