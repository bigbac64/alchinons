use serde::Deserialize;
use crate::definitions::position::Position;

#[derive(Deserialize)]
pub enum Command {
    Gather,
    Move {
        position: Position
    },
    
    /// Getter
    GetMap,
}
