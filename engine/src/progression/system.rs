use crate::events::Event;
use crate::progression::unlockable::{Unlockable, UnlockEffect};
use crate::state::GameState;

/// `effect` est une donnée pure à interpréter par l'appelant (`progression::command`,
/// seul point qui a accès à `states.world` en plus de `states.progression`) —
/// cette fonction ne mute jamais `states.world` directement.
pub struct PurchaseOutcome {
    pub events: Vec<Event>,
    pub effect: Option<UnlockEffect>,
}

impl PurchaseOutcome {
    fn failed(unlockable: Unlockable) -> Self {
        Self {
            events: vec![Event::UnlockFailed { unlockable: unlockable.definition().label.to_string() }],
            effect: None,
        }
    }
}

pub fn purchase(unlockable: Unlockable, inventory_name: String, states: &mut GameState) -> PurchaseOutcome {
    let current_tier = states.progression.tier(unlockable);

    if unlockable.is_maxed(current_tier) {
        return PurchaseOutcome::failed(unlockable);
    }

    let next_tier = current_tier + 1;
    let cost = unlockable.cost_at_tier(next_tier);

    let Some(inventory) = states.inventory.get_by_name_mut(inventory_name.as_str()) else {
        return PurchaseOutcome::failed(unlockable);
    };

    if !inventory.has_all(&cost) {
        return PurchaseOutcome::failed(unlockable);
    }

    inventory.excludes(cost);
    let inventory_changes = inventory.to_view();
    states.progression.set_tier(unlockable, next_tier);

    PurchaseOutcome {
        events: vec![
            Event::InventoryUpdated { changes: inventory_changes },
            Event::ProgressionUpdated { changes: states.progression.to_view() },
        ],
        effect: unlockable.effect_at_tier(next_tier),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resource::Resource;

    #[test]
    fn purchase_succeeds_with_enough_resources() {
        let mut states = GameState::new();
        states.inventory.player.add(Resource::Stone, 20);
        states.inventory.player.add(Resource::Wood, 10);

        let outcome = purchase(Unlockable::Oven, "player".to_string(), &mut states);

        assert!(matches!(outcome.events.as_slice(), [Event::InventoryUpdated { .. }, Event::ProgressionUpdated { .. }]));
        assert!(outcome.effect.is_none());
        assert_eq!(states.progression.tier(Unlockable::Oven), 1);
    }

    #[test]
    fn purchase_fails_without_enough_resources() {
        let mut states = GameState::new();

        let outcome = purchase(Unlockable::Oven, "player".to_string(), &mut states);

        assert!(matches!(outcome.events.as_slice(), [Event::UnlockFailed { .. }]));
        assert_eq!(states.progression.tier(Unlockable::Oven), 0);
    }

    #[test]
    fn purchase_fails_when_already_unlocked() {
        let mut states = GameState::new();
        states.inventory.player.add(Resource::Stone, 40);
        states.inventory.player.add(Resource::Wood, 20);

        purchase(Unlockable::Oven, "player".to_string(), &mut states);
        let outcome = purchase(Unlockable::Oven, "player".to_string(), &mut states);

        assert!(matches!(outcome.events.as_slice(), [Event::UnlockFailed { .. }]));
        assert_eq!(states.progression.tier(Unlockable::Oven), 1);
    }

    #[test]
    fn purchase_scaling_unlockable_increments_tier_and_returns_reveal_effect() {
        let mut states = GameState::new();
        states.inventory.player.add(Resource::Wood, 1);
        states.inventory.player.add(Resource::Fiber, 5);

        let outcome = purchase(Unlockable::ExplorationRadius, "player".to_string(), &mut states);

        assert!(matches!(outcome.events.as_slice(), [Event::InventoryUpdated { .. }, Event::ProgressionUpdated { .. }]));
        assert!(matches!(outcome.effect, Some(UnlockEffect::RevealMap { radius: 2 })));
        assert_eq!(states.progression.tier(Unlockable::ExplorationRadius), 1);
    }

    #[test]
    fn purchase_scaling_unlockable_fails_past_max_tier() {
        let mut states = GameState::new();
        states.progression.set_tier(Unlockable::ExplorationRadius, Unlockable::ExplorationRadius.max_tier().unwrap());

        let outcome = purchase(Unlockable::ExplorationRadius, "player".to_string(), &mut states);

        assert!(matches!(outcome.events.as_slice(), [Event::UnlockFailed { .. }]));
    }
}
