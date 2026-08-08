use std::collections::HashMap;
use serde::Serialize;

#[derive(Serialize, Debug, Clone)]
pub struct MapView {
    pub(crate) map: Vec<Vec<String>>,
    /// Masque de brouillard : `true` = case dévoilée. Même dimensions que `map`.
    pub(crate) explored: Vec<Vec<bool>>,
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
