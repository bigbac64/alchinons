use crate::definitions::position::Position;

pub struct Player {
    position: Position
}

pub fn new_player() -> Player {
    Player {
        position: Position { x: 4, y: 4 }
    }
}