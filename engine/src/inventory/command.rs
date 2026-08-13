use std::collections::HashMap;
use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::inventory::model::Inventory;
use crate::inventory::system;
use crate::resource::Resource;
use crate::state::GameState;

#[derive(Deserialize)]
pub struct TransferInventoryPayload {
    pub source: String,
    pub destination: String,
    pub items: HashMap<Resource, u32>,
}

impl StructCommand for TransferInventoryPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::events(system::execute(self.source, self.destination, self.items, states))
    }
}

#[derive(Deserialize)]
pub struct GetInventoryPayload {
    pub name: String,
}

impl StructCommand for GetInventoryPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        let view = states.inventory.get_by_name(self.name.as_str())
            .unwrap_or(&Inventory::new(self.name))
            .to_view();
        Outcome::output(CommandOutput::Inventory(view))
    }
}
