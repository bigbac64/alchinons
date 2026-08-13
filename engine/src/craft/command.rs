use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::craft::recipe::Recipe;
use crate::craft::system;
use crate::state::GameState;

#[derive(Deserialize)]
pub struct CraftPayload {
    pub recipe: Recipe,
    pub inventory: String,
}

impl StructCommand for CraftPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::events(system::execute(self.recipe, self.inventory, states))
    }
}

#[derive(Deserialize)]
pub struct GetRecipesPayload;

impl StructCommand for GetRecipesPayload {
    fn execute(self, _states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::Recipes(Recipe::view()))
    }
}
