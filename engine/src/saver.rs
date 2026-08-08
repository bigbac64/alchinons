use std::fs;
use std::path::Path;
use serde::{Serialize};
use serde::de::DeserializeOwned;


/// Charge l'état de progression depuis le disque. Fail-soft : fichier
/// absent ou corrompu => état vierge, ne bloque jamais le démarrage du
/// moteur pour une sauvegarde illisible.
pub fn load<T: DeserializeOwned + std::default::Default>(path: &Path) -> T {
    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

/// Écrase le fichier de sauvegarde avec l'état courant (paliers à 0 omis).
pub fn save<T: Serialize>(path: &Path, state: &T) -> std::io::Result<()> {
    let content = serde_json::to_string(state).map_err(std::io::Error::other)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, content)
}

/// Supprime la sauvegarde
pub fn reset(path: &Path, name: &'static str) {
    fs::remove_file(&*path.join(name)).ok().unwrap_or(println!("sauvegarde reset {}", name));
}
