use serde::Serialize;
use crate::progression::unlockable::Unlockable;
use crate::resource::Resource;

#[derive(Serialize, Debug, Clone)]
pub struct UnlockAmountView {
    pub(crate) resource: Resource,
    pub(crate) quantity: u32,
}

#[derive(Serialize, Debug, Clone)]
pub struct UnlockableStatusView {
    pub(crate) id: Unlockable,
    pub(crate) label: String,
    pub(crate) unlocked: bool,
    pub(crate) tier: u32,
    pub(crate) max_tier: Option<u32>,
    /// Coût pour atteindre le palier suivant. `None` si déjà au palier max —
    /// le front n'a jamais à décider seul qu'un déblocage est "terminé".
    pub(crate) next_cost: Option<Vec<UnlockAmountView>>,
}

#[derive(Serialize, Debug, Clone)]
pub struct ProgressionView {
    pub(crate) unlockables: Vec<UnlockableStatusView>,
}
