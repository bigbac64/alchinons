use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::progression::view::{UnlockAmountView, UnlockableStatusView};
use crate::resource::Resource;

/// Coût d'un déblocage. `Fixed` = achat unique (un seul palier possible,
/// `max_tier() == Some(1)`). `Scaling` = coût qui croît géométriquement à
/// chaque palier (`growth_percent = 150` => x1.5/palier), borné par
/// `max_tier` (`None` = illimité).
pub enum CostFormula {
    Fixed(&'static [(Resource, u32)]),
    Scaling {
        base: &'static [(Resource, u32)],
        growth_percent: u32,
        max_tier: Option<u32>,
    },
}

pub struct UnlockableDefinition {
    pub label: &'static str,
    pub cost: CostFormula,
}

const OVEN: UnlockableDefinition = UnlockableDefinition {
    label: "Four",
    cost: CostFormula::Fixed(&[(Resource::Stone, 20), (Resource::Wood, 10)]),
};

// x1.5/palier, plafonné à 6 paliers (cohérent avec la grille 15x13 — au-delà,
// tout serait déjà révélé). Valeur de départ à ajuster en jouant.
const EXPLORATION_RADIUS: UnlockableDefinition = UnlockableDefinition {
    label: "Zone explorée",
    cost: CostFormula::Scaling {
        base: &[(Resource::Wood, 1), (Resource::Fiber, 5)],
        growth_percent: 150,
        max_tier: Some(6),
    },
};

const ALL: &[Unlockable] = &[Unlockable::Oven, Unlockable::ExplorationRadius];

/// Effet cross-domaine déclenché par un achat réussi. Reste une donnée pure :
/// `progression` ne connaît pas `world::map` (le glue vit dans `engine.rs`,
/// seul point qui a accès à tout `GameState`).
pub enum UnlockEffect {
    RevealMap { radius: u32 },
}

#[derive(Copy, Clone, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
pub enum Unlockable {
    Oven,
    ExplorationRadius,
}

impl Unlockable {
    pub fn definition(&self) -> &'static UnlockableDefinition {
        match self {
            Unlockable::Oven => &OVEN,
            Unlockable::ExplorationRadius => &EXPLORATION_RADIUS,
        }
    }

    pub fn all() -> &'static [Unlockable] {
        ALL
    }

    pub fn max_tier(&self) -> Option<u32> {
        match &self.definition().cost {
            CostFormula::Fixed(_) => Some(1),
            CostFormula::Scaling { max_tier, .. } => *max_tier,
        }
    }

    pub fn is_maxed(&self, current_tier: u32) -> bool {
        self.max_tier().is_some_and(|max| current_tier >= max)
    }

    /// Coût pour atteindre `tier` (1-based) depuis 0.
    pub fn cost_at_tier(&self, tier: u32) -> HashMap<Resource, u32> {
        match &self.definition().cost {
            CostFormula::Fixed(cost) => cost.iter().cloned().collect(),
            CostFormula::Scaling { base, growth_percent, .. } => {
                let multiplier = (*growth_percent as f64 / 100.0).powi(tier as i32 - 1);
                base.iter()
                    .map(|(resource, quantity)| (*resource, (*quantity as f64 * multiplier).ceil() as u32))
                    .collect()
            }
        }
    }

    /// Rayon total de brouillard révélé après avoir atteint `tier` paliers
    /// d'exploration — `None` pour tout `Unlockable` sans effet sur la carte
    /// ou pour `tier == 0`. La valeur de base (1) coïncide volontairement
    /// avec le rayon initial câblé en dur dans `Map::from_array` (module
    /// `world`, non importable ici) : c'est une duplication intentionnelle
    /// d'un paramètre de design, pas une donnée technique partagée.
    pub fn reveal_radius_at_tier(&self, tier: u32) -> Option<u32> {
        match self {
            Unlockable::ExplorationRadius if tier > 0 => Some(1 + tier),
            _ => None,
        }
    }

    pub fn effect_at_tier(&self, tier: u32) -> Option<UnlockEffect> {
        self.reveal_radius_at_tier(tier).map(|radius| UnlockEffect::RevealMap { radius })
    }

    fn cost_view(&self, tier: u32) -> Vec<UnlockAmountView> {
        self.cost_at_tier(tier).into_iter()
            .map(|(resource, quantity)| UnlockAmountView { resource, quantity })
            .collect()
    }

    pub fn to_view(&self, current_tier: u32) -> UnlockableStatusView {
        let next_cost = if self.is_maxed(current_tier) {
            None
        } else {
            Some(self.cost_view(current_tier + 1))
        };

        UnlockableStatusView {
            id: *self,
            label: self.definition().label.to_string(),
            unlocked: current_tier >= 1,
            tier: current_tier,
            max_tier: self.max_tier(),
            next_cost,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scaling_cost_grows_geometrically_per_tier() {
        let tier1 = Unlockable::ExplorationRadius.cost_at_tier(1);
        let tier2 = Unlockable::ExplorationRadius.cost_at_tier(2);

        assert_eq!(tier1.get(&Resource::Fiber), Some(&5));
        // 5 * 1.5 = 7.5 -> arrondi au supérieur
        assert_eq!(tier2.get(&Resource::Fiber), Some(&8));
    }

    #[test]
    fn fixed_cost_is_maxed_after_first_tier() {
        assert!(!Unlockable::Oven.is_maxed(0));
        assert!(Unlockable::Oven.is_maxed(1));
    }
}
