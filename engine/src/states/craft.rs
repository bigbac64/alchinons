use crate::definitions::recipe::Recipe;

#[derive(Clone)]
pub struct PendingCraft {
    pub recipe: Recipe,
    pub inventory_name: String,
    pub remaining_ticks: u32,
}

pub struct CraftState {
    pending: Vec<PendingCraft>,
}

impl CraftState {
    pub fn new() -> Self {
        Self { pending: Vec::new() }
    }

    pub fn schedule(&mut self, recipe: Recipe, inventory_name: String) {
        self.pending.push(PendingCraft {
            recipe,
            inventory_name,
            remaining_ticks: recipe.definition().duration,
        });
    }

    /// Avance tous les crafts en cours d'un tick et retourne ceux qui se terminent.
    /// Appelé par CraftSystem::tick, lui-même destiné à être branché sur un futur
    /// scheduler/boucle de jeu (cf. commentaire tick() dans engine.rs).
    pub fn tick(&mut self) -> Vec<PendingCraft> {
        let mut completed = Vec::new();

        self.pending.retain_mut(|craft| {
            craft.remaining_ticks = craft.remaining_ticks.saturating_sub(1);
            if craft.remaining_ticks == 0 {
                completed.push(craft.clone());
                false
            } else {
                true
            }
        });

        completed
    }
}
