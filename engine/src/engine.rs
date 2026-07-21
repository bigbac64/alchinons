use std::mem::take;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::commands::CommandOutput;
use crate::definitions::inventory::Inventory;
use crate::definitions::terrain::Terrain;
use crate::events::Event;
use crate::states::GameState;
use crate::systems::gather::GatherSystem;
use crate::systems::moving::MoveSystem;
use crate::systems::transfert::{TransferInventorySystem};

pub struct GameEngine {
    states: GameState,
    gather_system: GatherSystem,
    move_system: MoveSystem,
    transfer_system: TransferInventorySystem,
    events: Vec<Event>,
    notify: Arc<Notify>, // Arc = partage l'objet avec un autrer
}


impl GameEngine {
    pub fn new(notify: Arc<Notify>) -> Self {
        Self {
            states: GameState::new(),
            gather_system: GatherSystem::new(),
            move_system: MoveSystem::new(),
            transfer_system: TransferInventorySystem::new(),
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
            Command::GetPlayer => {
                CommandOutput::Player(self.states.player.player.position)
            },
            Command::Move {position} => {
                events = self.move_system.execute(position, &mut self.states);
                CommandOutput::None
            },
            Command::TransferInventory {source, destination} => {
                events =self.transfer_system.execute(source, destination, &mut self.states);
                CommandOutput::None
            },
            Command::GetInventory {name} => {
                CommandOutput::Inventory(
                    self.states.inventory.get_by_name(
                        name.as_str()
                    ).unwrap_or(&Inventory::new(name))
                        .to_view()
                )
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