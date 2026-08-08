use serde::Deserialize;
use crate::progression::unlockable::Unlockable;

#[derive(Deserialize)]
pub struct PurchasePayload {
    pub unlockable: Unlockable,
    pub inventory: String,
}
