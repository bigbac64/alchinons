use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use crate::progression::state::ProgressionState;
use crate::progression::unlockable::Unlockable;
use crate::saver;


pub const PROGRESSION_SAVE_NAME: &'static str = "progression.json";

#[derive(Serialize, Deserialize, Default)]
struct ProgressionSave {
    tiers: Vec<(Unlockable, u32)>,
}

/// Charge l'état de progression depuis le disque. Fail-soft : fichier
/// absent ou corrompu => état vierge, ne bloque jamais le démarrage du
/// moteur pour une sauvegarde illisible.
pub fn load(path: &PathBuf) -> ProgressionState {
    let save: ProgressionSave = saver::load(&path.join(PROGRESSION_SAVE_NAME));

    let mut state = ProgressionState::new();
    for (unlockable, tier) in save.tiers {
        state.set_tier(unlockable, tier);
    }
    state
}

/// Écrase le fichier de sauvegarde avec l'état courant (paliers à 0 omis).
pub fn save(path: &PathBuf, state: &ProgressionState) -> std::io::Result<()> {
    let save = &ProgressionSave {
        tiers: Unlockable::all().iter()
            .map(|&unlockable| (unlockable, state.tier(unlockable)))
            .filter(|(_, tier)| *tier > 0)
            .collect(),
    };

    saver::save(&path.join(PROGRESSION_SAVE_NAME), save)
}


#[cfg(test)]
mod tests {
    use super::*;

    fn temp_path() -> std::path::PathBuf {
        std::env::temp_dir().join(format!("alchinons-progression-test-{}.json", uuid::Uuid::new_v4()))
    }

    #[test]
    fn save_then_load_roundtrips_state() {
        let path = temp_path();
        let mut state = ProgressionState::new();
        state.set_tier(Unlockable::Oven, 1);

        save(&path, &state).unwrap();
        let loaded = load(&path);

        assert_eq!(loaded.tier(Unlockable::Oven), 1);
        fs::remove_file(&path).unwrap();
    }

    #[test]
    fn load_missing_file_returns_default_state() {
        let path = temp_path();

        let loaded = load(&path);

        assert_eq!(loaded.tier(Unlockable::Oven), 0);
    }
}
