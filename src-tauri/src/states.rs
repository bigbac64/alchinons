use std::sync::{Arc, Mutex};
use tokio::sync::Notify;
use engine::engine::GameEngine;

pub struct AppState {
    pub engine: Mutex<GameEngine>,
    pub notify: Arc<Notify>,
}

impl AppState {
    pub fn new() -> Self {
        let notify = Arc::new(
            Notify::new()
        );
        Self {
            engine: Mutex::new(
                GameEngine::new(notify.clone())
            ),
            notify,
        }
    }
}