use serde::Serialize;
use crate::definitions::recipe::Recipe;
use crate::definitions::resources::Resource;

#[derive(Serialize)]
pub struct RecipeAmountView {
    pub(crate) resource: Resource,
    pub(crate) quantity: u32,
}

#[derive(Serialize)]
pub struct RecipeDefinitionView {
    pub(crate) id: Recipe,
    pub(crate) label: String,
    pub(crate) inputs: Vec<RecipeAmountView>,
    pub(crate) outputs: Vec<RecipeAmountView>,
    pub(crate) duration: u32,
}

#[derive(Serialize)]
pub struct RecipeView {
    pub(crate) recipes: Vec<RecipeDefinitionView>,
}
