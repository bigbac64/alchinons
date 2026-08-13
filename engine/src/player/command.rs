use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::state::GameState;

#[derive(Deserialize)]
pub struct GetPlayerPayload;

impl StructCommand for GetPlayerPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::Player(states.player.player.position))
    }
}
