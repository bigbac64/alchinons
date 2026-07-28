use serde::Deserialize;
use crate::craft::recipe::Recipe;

#[derive(Deserialize)]
pub struct CraftPayload {
    pub recipe: Recipe,
    pub inventory: String,
}
