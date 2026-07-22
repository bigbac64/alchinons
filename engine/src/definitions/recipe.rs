use serde::{Deserialize, Serialize};
use crate::definitions::resources::Resource;
use crate::views::recipe::{RecipeAmountView, RecipeDefinitionView, RecipeView};

/// `duration` est en ticks (0 = résolu immédiatement par CraftSystem::execute,
/// > 0 = mis en attente dans CraftState et résolu plus tard par CraftSystem::tick).
/// C'est ce qui permet à la même structure de couvrir un craft d'atelier instantané
/// et une production étalée dans le temps (agriculture, cuisson longue, ...) sans
/// dupliquer de type : seul le system qui consomme la définition change de comportement.
pub struct RecipeDefinition {
    pub inputs: &'static [(Resource, u32)],
    pub outputs: &'static [(Resource, u32)],
    pub duration: u32,
    pub label: &'static str,
}

const PLANK: RecipeDefinition = RecipeDefinition {
    inputs: &[(Resource::Wood, 2)],
    outputs: &[(Resource::Plank, 1)],
    duration: 0,
    label: "Planche",
};

const CHARCOAL: RecipeDefinition = RecipeDefinition {
    inputs: &[(Resource::Wood, 3)],
    outputs: &[(Resource::Charcoal, 1)],
    duration: 5,
    label: "Charbon de bois",
};

impl RecipeDefinition {
    fn to_view(&self, id: Recipe) -> RecipeDefinitionView {
        let to_amounts = |amounts: &[(Resource, u32)]| {
            amounts.iter().map(|(resource, quantity)| RecipeAmountView {
                resource: *resource,
                quantity: *quantity,
            }).collect()
        };

        RecipeDefinitionView {
            id,
            label: self.label.to_string(),
            inputs: to_amounts(self.inputs),
            outputs: to_amounts(self.outputs),
            duration: self.duration,
        }
    }
}

const ALL: &[Recipe] = &[Recipe::Plank, Recipe::Charcoal];

#[derive(Copy, Clone, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
pub enum Recipe {
    Plank,
    Charcoal,
}

impl Recipe {
    pub fn definition(&self) -> &'static RecipeDefinition {
        match self {
            Recipe::Plank => &PLANK,
            Recipe::Charcoal => &CHARCOAL,
        }
    }

    pub fn view() -> RecipeView {
        RecipeView {
            recipes: ALL.iter().map(|recipe| recipe.definition().to_view(*recipe)).collect(),
        }
    }
}
