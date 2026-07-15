use tauri::State;
use engine::engine::{Command};
use crate::states::AppState;

#[tauri::command]
pub fn engine(state: State<AppState>, command: Command) -> Result<(), String> {
    let mut engine = state.engine.lock().unwrap();

    engine.execute(command);

    Ok(())
}
