use tauri::State;
use engine::commands::CommandOutput;
use engine::engine::{Command};
use crate::states::AppState;

#[tauri::command]
pub fn engine(state: State<AppState>, command: Command) -> Result<CommandOutput, String> {
    let mut engine = state.engine.lock().unwrap();

    Ok(engine.execute(command))
}
