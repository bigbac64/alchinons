use serde::Deserialize;
use crate::definitions::recipe::Recipe;

#[derive(Deserialize)]
pub struct CraftPayload {
    pub recipe: Recipe,
    pub inventory: String,
}
