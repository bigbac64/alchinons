mod commands;
mod states;

use tauri::{Emitter, Manager};
use crate::commands::engine;
use crate::states::AppState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, engine])
        .setup(|app| {
            let app_state = AppState::new();
            let notify = app_state.notify.clone(); // le même Arc que celui déjà dans engine
            app.manage(app_state);

            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
               loop {
                   tokio::select! {
                       _ = notify.notified() => {} // reste ici en silence tant qu'il n'y a pas de notif
                   }

                   let state = app_handle.state::<AppState>();
                   let mut engine = state.engine.lock().unwrap();

                   let events = engine.drain_events();

                   drop(engine);

                   for ev in events {
                       app_handle.emit(ev.name(), ev.payload()).ok();
                   }
               };
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
