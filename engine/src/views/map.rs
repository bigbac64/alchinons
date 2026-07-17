use serde::{Serialize};

#[derive(Serialize)]
pub struct MapView {
    pub(crate) map: Vec<Vec<String>>
}