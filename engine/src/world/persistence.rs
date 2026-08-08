use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::saver;
use crate::world::map::Map;

pub const WOLD_SAVE_NAME: &'static str = "world.json";

#[derive(Serialize, Deserialize, Default)]
struct WorldSave {
    map: Map,
}

/// Charge l'état de progression depuis le disque. Fail-soft : fichier
/// absent ou corrompu => état vierge, ne bloque jamais le démarrage du
/// moteur pour une sauvegarde illisible.
pub fn load(path: &PathBuf) -> Map {
    let save: WorldSave = saver::load(&path.join(WOLD_SAVE_NAME));

    save.map
}

/// Écrase le fichier de sauvegarde avec l'état courant (paliers à 0 omis).
pub fn save(path: &PathBuf, state: &Map) -> std::io::Result<()> {
    let save = &WorldSave {
        map: Map {
            map: state.map.clone(),
            tiles: state.tiles.clone(),
            explored: state.explored.clone(),
            camp: state.camp()
        }
    };

    saver::save(&path.join(WOLD_SAVE_NAME), save)
}