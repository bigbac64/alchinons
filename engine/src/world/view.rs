use std::collections::HashMap;
use serde::Serialize;
use crate::position::Position;

#[derive(Serialize)]
pub struct MapView {
    pub(crate) map: Vec<Vec<String>>
}

#[derive(Serialize)]
pub struct TerrainView {
    pub(crate) terrain: HashMap<String, TerrainDefinitionView>
}

#[derive(Serialize)]
pub struct TerrainDefinitionView {
    pub(crate) walkable: bool,
    pub(crate) cost: u32,
    pub(crate) label: String,
    pub(crate) color: String,
}

#[derive(Serialize)]
pub struct TileView {
    pub terrain: String,
    pub areas: Vec<AreaView>,
}

#[derive(Serialize)]
pub struct AreaView {
    pub area_type: String,
    pub label: String,
    pub color: String,
    pub position: Position,
    pub shape: ShapeView,
}

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum ShapeView {
    Rectangle { width: u32, height: u32 },
    Circle { radius: u32 },
}
