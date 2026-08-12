use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::saver;
use crate::world::state::WorldState;

pub const WOLD_SAVE_NAME: &'static str = "world.json";

#[derive(Serialize, Deserialize, Default)]
struct WorldSave {
    world: WorldState,
}

/// Charge l'état de progression depuis le disque. Fail-soft : fichier
/// absent ou corrompu => état vierge, ne bloque jamais le démarrage du
/// moteur pour une sauvegarde illisible.
pub fn load(path: &PathBuf) -> WorldState {
    let save: WorldSave = saver::load(&path.join(WOLD_SAVE_NAME));

    save.world
}

/// Écrase le fichier de sauvegarde avec l'état courant (paliers à 0 omis).
pub fn save(path: &PathBuf, state: &WorldState) -> std::io::Result<()> {
    let save = &WorldSave {
        world: state.clone()
    };

    saver::save(&path.join(WOLD_SAVE_NAME), save)
}