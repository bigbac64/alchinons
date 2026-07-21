use serde::{Deserialize, Serialize};
use crate::definitions::resources::Resource;

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
}
