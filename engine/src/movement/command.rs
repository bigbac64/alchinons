use serde::Deserialize;
use crate::commands::outcome::Outcome;
use crate::commands::{StructCommand};
use crate::movement::system::moving_player;
use crate::position::Position;
use crate::state::GameState;


#[derive(Deserialize)]
pub struct MovePayload {
    pub position: Position,
}

impl StructCommand for MovePayload{
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::events(moving_player(self.position, states))
    }
}