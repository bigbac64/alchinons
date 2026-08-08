use std::collections::HashMap;
use crate::progression::unlockable::Unlockable;
use crate::progression::view::ProgressionView;

pub struct ProgressionState {
    tiers: HashMap<Unlockable, u32>,
}

impl ProgressionState {
    pub fn new() -> Self {
        Self { tiers: HashMap::new() }
    }

    pub fn tier(&self, unlockable: Unlockable) -> u32 {
        self.tiers.get(&unlockable).copied().unwrap_or(0)
    }

    pub fn set_tier(&mut self, unlockable: Unlockable, tier: u32) {
        self.tiers.insert(unlockable, tier);
    }

    pub fn to_view(&self) -> ProgressionView {
        ProgressionView {
            unlockables: Unlockable::all().iter()
                .map(|unlockable| unlockable.to_view(self.tier(*unlockable)))
                .collect(),
        }
    }
}
