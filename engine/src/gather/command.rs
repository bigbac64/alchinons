use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::gather::system;
use crate::resource::Resource;
use crate::state::GameState;

#[derive(Deserialize)]
pub struct GatherPayload;

impl StructCommand for GatherPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::GatherOptions(system::propose(states)))
    }
}

#[derive(Deserialize)]
pub struct GatherSelectPayload {
    pub resource: Resource,
}

impl StructCommand for GatherSelectPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        let (options, events) = system::select(self.resource, states);
        Outcome::both(CommandOutput::GatherOptions(options), events)
    }
}
