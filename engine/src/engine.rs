use std::mem::take;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::commands::CommandOutput;
use crate::definitions::terrain::Terrain;
use crate::events::Event;
use crate::states::GameState;
use crate::systems::gather::GatherSystem;
use crate::systems::moving::MoveSystem;

pub struct GameEngine {
    states: GameState,
    gather_system: GatherSystem,
    move_system: MoveSystem,
    events: Vec<Event>,
    notify: Arc<Notify>, // Arc = partage l'objet avec un autrer
}


impl GameEngine {
    pub fn new(notify: Arc<Notify>) -> Self {
        Self {
            states: GameState::new(),
            gather_system: GatherSystem::new(),
            move_system: MoveSystem::new(),
            events: Vec::new(),
            notify,
        }
    }
    
    pub fn drain_events(&mut self) -> Vec<Event>{
        take(&mut self.events)
    }

    pub fn execute(&mut self, command: Command) -> CommandOutput{
        let mut events = vec![];

        let output: CommandOutput = match command {
            Command::Gather => {
                events = self.gather_system.execute(&mut self.states);
                CommandOutput::None
            },
            Command::GetMap => {
                CommandOutput::Map(self.states.map.to_view())
            },
            Command::GetTerrain => {
                CommandOutput::Terrain(Terrain::view())
            },
            Command::Move {position} => {
                events = self.move_system.execute(position, &mut self.states);
                CommandOutput::None
            },
        };

        if !events.is_empty() {
            self.events.extend(events);
            self.notify.notify_one();
        }

        output
    }

    //fn tick() un genre d'update general en boucle infini qui lance des events

    //fn scheduler() un genre de timer qui lance aussi des events
}