use serde::Serialize;
use crate::craft::recipe::Recipe;
use crate::resource::Resource;

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
