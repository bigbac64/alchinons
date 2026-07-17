use crate::ecs::player::Player;

pub struct PlayerState {
    pub(crate) player: Player,
}

impl PlayerState {
    pub fn new() -> Self {
        Self {
            player: Player::new()
        }
    }
}