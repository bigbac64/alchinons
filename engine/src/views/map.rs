use serde::Deserialize;

#[derive(Deserialize)]
pub struct MapView {
    pub(crate) map: Vec<Vec<String>>
}