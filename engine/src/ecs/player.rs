use crate::definitions::position::Position;

pub struct Player {
    pub position: Position
}

impl Player {
    pub fn new() -> Player {
        Player {
            position: Position { x: 4, y: 4 }
        }
    }
}
