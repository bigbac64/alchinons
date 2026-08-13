use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::position::Position;
use crate::state::GameState;
use crate::world::system::TileSystem;
use crate::world::terrain::Terrain;

#[derive(Deserialize)]
pub struct ExploitablePayload {
    pub position: Position,
}

impl StructCommand for ExploitablePayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        let exploitable = TileSystem::exploitable(self.position.x as usize, self.position.y as usize, states);
        Outcome::output(CommandOutput::ExploitableTile(exploitable))
    }
}

#[derive(Deserialize)]
pub struct ExploitablePlayerPositionPayload;

impl StructCommand for ExploitablePlayerPositionPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::ExploitableTile(TileSystem::exploitable_player_position(states)))
    }
}

#[derive(Deserialize)]
pub struct GetMapPayload;

impl StructCommand for GetMapPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::Map(states.world.map.to_view()))
    }
}

#[derive(Deserialize)]
pub struct GetTerrainPayload;

impl StructCommand for GetTerrainPayload {
    fn execute(self, _states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::Terrain(Terrain::view()))
    }
}
