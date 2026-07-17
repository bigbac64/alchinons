use std::mem::take;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::events::Event;
use crate::states::GameState;
use crate::systems::gather::GatherSystem;

pub struct GameEngine {
    states: GameState,
    gather_system: GatherSystem,
    events: Vec<Event>,
    notify: Arc<Notify>, // Arc = partage l'objet avec un autrer
}


impl GameEngine {
    pub fn new(notify: Arc<Notify>) -> Self {
        Self {
            states: GameState::new(),
            gather_system: GatherSystem::new(),
            events: Vec::new(),
            notify,
        }
    }
    
    pub fn drain_events(&mut self) -> Vec<Event>{
        take(&mut self.events)
    }

    pub fn execute(&mut self, command: Command){
        // remonte d'enventuel event
        let events = match command {
            Command::Gather => self.gather_system.execute(&mut self.states),
            Command::GetMap => self.states.map.to_view(),
            Command::Move {position} => vec![],
        };

        if !events.is_empty() {
            self.events.extend(events);
            self.notify.notify_one();
        }
    }

    //fn tick() un genre d'update general en boucle infini qui lance des events

    //fn scheduler() un genre de timer qui lance aussi des events
}