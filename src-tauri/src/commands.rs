use tauri::State;
use engine::commands::outcome::CommandOutput;
use engine::engine::{Command};
use crate::states::AppState;

#[tauri::command]
pub fn engine(state: State<AppState>, command: Command) -> Result<CommandOutput, String> {
    let mut engine = state.engine.lock().unwrap();

    Ok(engine.execute(command))
}

#[cfg(test)]
mod tests {
    use engine::commands::EngineCommand;
    use super::*;

    #[test]
    fn command_name_matches_contract() {
        // Garde-fou : si la fonction `engine` est renommée, ce test rappelle
        // de mettre à jour Command::NAME (et donc ENGINE_COMMAND côté JS).
        assert_eq!(stringify!(engine), Command::NAME);
    }
}