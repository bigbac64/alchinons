use serde::{Deserialize, Serialize};

#[derive(Eq, Ord, PartialEq, PartialOrd, Hash, Copy, Clone, Debug, Serialize, Deserialize)]
pub struct Position {
    pub x: u32,
    pub y: u32,
}

impl Position {
    pub fn sub(&self, other: Position) -> Position {
        Position {
            x: self.x.checked_sub(other.x).unwrap_or(0),
            y: self.y.checked_sub(other.y).unwrap_or(0),
        }
    }
}