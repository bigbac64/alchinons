use crate::position::Position;

pub struct Player {
    pub position: Position
}

impl Player {
    pub fn new() -> Player {
        Player {
            position: Position { x: 7, y:  6 }
        }
    }
}
