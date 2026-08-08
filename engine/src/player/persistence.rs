use std::path::{PathBuf};
use serde::{Deserialize, Serialize};
use crate::player::model::Player;
use crate::player::state::PlayerState;
use crate::saver;

pub const PLAYER_SAVE_NAME: &'static str = "player.json";

#[derive(Serialize, Deserialize, Default)]
struct PlayerSave {
    tiers: Player
}


pub fn load(path: &PathBuf) -> PlayerState {
    let save: PlayerSave = saver::load(&path.join(PLAYER_SAVE_NAME));

    let mut state = PlayerState::new();
    state.player = save.tiers;
    state
}

pub fn save(path: &PathBuf, state: &PlayerState) -> std::io::Result<()> {
    let save = &PlayerSave {
        tiers: state.player
    };

    saver::save(&path.join(PLAYER_SAVE_NAME), save)
}
