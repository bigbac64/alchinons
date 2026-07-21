use std::mem::take;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::commands::outcome::{CommandOutput, SystemOutcome};
use crate::definitions::inventory::Inventory;
use crate::definitions::terrain::Terrain;
use crate::events::Event;
use crate::states::GameState;
use crate::systems::gather::GatherSystem;
use crate::systems::moving::MoveSystem;
use crate::systems::transfert::{TransferInventorySystem};
use crate::systems::craft::CraftSystem;

pub struct GameEngine {
    states: GameState,
    gather_system: GatherSystem,
    move_system: MoveSystem,
    transfer_system: TransferInventorySystem,
    craft_system: CraftSystem,
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
            craft_system: CraftSystem::new(),
            events: Vec::new(),
            notify,
        }
    }
    
    pub fn drain_events(&mut self) -> Vec<Event>{
        take(&mut self.events)
    }

    pub fn execute(&mut self, command: Command) -> CommandOutput{
        let SystemOutcome { output, events } = match command {
            Command::Gather => {
                SystemOutcome::events(self.gather_system.execute(&mut self.states))
            },
            Command::GetMap => {
                SystemOutcome::output(CommandOutput::Map(self.states.map.to_view()))
            },
            Command::GetTerrain => {
                SystemOutcome::output(CommandOutput::Terrain(Terrain::view()))
            },
            Command::GetPlayer => {
                SystemOutcome::output(CommandOutput::Player(self.states.player.player.position))
            },
            Command::Move {position} => {
                SystemOutcome::events(self.move_system.execute(position, &mut self.states))
            },
            Command::TransferInventory { payload } => {
                SystemOutcome
                ::events(self.transfer_system
                    .execute(payload.source, payload.destination, payload.items, &mut self.states))
            },
            Command::Craft { payload } => {
                SystemOutcome::events(self.craft_system.execute(payload.recipe, payload.inventory, &mut self.states))
            },
            Command::GetInventory {name} => {
                SystemOutcome::output(CommandOutput::Inventory(
                    self.states.inventory.get_by_name(
                        name.as_str()
                    ).unwrap_or(&Inventory::new(name))
                        .to_view()
                ))
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