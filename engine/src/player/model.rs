use serde::{Deserialize, Serialize};
use crate::position::Position;

#[derive(Serialize, Deserialize, Copy, Clone)]
pub struct Player {
    pub position: Position
}

impl Default for Player {
    fn default() -> Self {
        Player {
            position: Position { x: 7, y:  6 }
        }
    }
}

impl Player {

    pub fn new() -> Player {
        Player::default()
    }
}
