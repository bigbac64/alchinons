use std::collections::HashMap;
use crate::definitions::recipe::Recipe;
use crate::definitions::resources::Resource;
use crate::events::Event;
use crate::states::GameState;

pub struct CraftSystem {}

impl CraftSystem {
    pub fn new() -> Self { Self {} }

    pub fn execute(&self, recipe: Recipe, inventory_name: String, states: &mut GameState) -> Vec<Event> {
        let definition = recipe.definition();
        let inputs: HashMap<Resource, u32> = definition.inputs.iter().cloned().collect();

        let Some(inventory) = states.inventory.get_by_name_mut(inventory_name.as_str()) else {
            return vec![];
        };

        if !inventory.has_all(&inputs) {
            return vec![Event::CraftFailed { recipe: definition.label.to_string() }];
        }

        inventory.excludes(inputs);

        if definition.duration == 0 {
            let outputs: HashMap<Resource, u32> = definition.outputs.iter().cloned().collect();
            inventory.add_multi(outputs);
            vec![Event::InventoryUpdated { changes: inventory.to_view() }]
        } else {
            let changes = inventory.to_view();
            states.craft.schedule(recipe, inventory_name);
            vec![Event::InventoryUpdated { changes }]
        }
    }

    /// Résout les crafts différés arrivés à terme. À appeler depuis un futur
    /// tick()/scheduler de la boucle de jeu (cf. engine.rs) — pas encore câblé.
    pub fn tick(&self, states: &mut GameState) -> Vec<Event> {
        let completed = states.craft.tick();
        let mut events = Vec::new();

        for craft in completed {
            let outputs: HashMap<Resource, u32> = craft.recipe.definition().outputs.iter().cloned().collect();
            if let Some(inventory) = states.inventory.get_by_name_mut(craft.inventory_name.as_str()) {
                inventory.add_multi(outputs);
                events.push(Event::InventoryUpdated { changes: inventory.to_view() });
            }
        }

        events
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instant_recipe_consumes_inputs_and_produces_outputs() {
        let mut states = GameState::new();
        states.inventory.player.add(Resource::Wood, 2);
        let system = CraftSystem::new();

        let events = system.execute(Recipe::Plank, "player".to_string(), &mut states);

        assert!(matches!(events.as_slice(), [Event::InventoryUpdated { .. }]));
        let view = states.inventory.player.to_view();
        let plank = view.items.iter().find(|i| i.name == Resource::Plank);
        assert_eq!(plank.map(|i| i.quantity), Some(1));
    }

    #[test]
    fn craft_fails_without_enough_resources() {
        let mut states = GameState::new();
        let system = CraftSystem::new();

        let events = system.execute(Recipe::Plank, "player".to_string(), &mut states);

        assert!(matches!(events.as_slice(), [Event::CraftFailed { .. }]));
    }

    #[test]
    fn deferred_recipe_resolves_after_enough_ticks() {
        let mut states = GameState::new();
        states.inventory.player.add(Resource::Wood, 3);
        let system = CraftSystem::new();

        system.execute(Recipe::Charcoal, "player".to_string(), &mut states);

        for _ in 0..Recipe::Charcoal.definition().duration - 1 {
            assert!(system.tick(&mut states).is_empty());
        }

        let events = system.tick(&mut states);
        assert!(matches!(events.as_slice(), [Event::InventoryUpdated { .. }]));
        let view = states.inventory.player.to_view();
        let charcoal = view.items.iter().find(|i| i.name == Resource::Charcoal);
        assert_eq!(charcoal.map(|i| i.quantity), Some(1));
    }
}
