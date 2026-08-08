use std::mem::take;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::commands::outcome::{CommandOutput, SystemOutcome};
use crate::inventory::model::Inventory;
use crate::world::terrain::Terrain;
use crate::craft::recipe::Recipe;
use crate::events::Event;
use crate::state::GameState;
use crate::gather::system::GatherSystem;
use crate::movement::system::MoveSystem;
use crate::inventory::system::TransferInventorySystem;
use crate::craft::system::CraftSystem;
use crate::progression::{system::ProgressionSystem, unlockable::{Unlockable, UnlockEffect}};
use crate::resource::Resource;
use crate::{player, progression, saver, world};
use crate::player::persistence::PLAYER_SAVE_NAME;
use crate::progression::persistence::PROGRESSION_SAVE_NAME;
use crate::world::persistence::WOLD_SAVE_NAME;

pub struct GameEngine {
    states: GameState,
    gather_system: GatherSystem,
    move_system: MoveSystem,
    transfer_system: TransferInventorySystem,
    craft_system: CraftSystem,
    progression_system: ProgressionSystem,
    events: Vec<Event>,
    notify: Arc<Notify>, // Arc = partage l'objet avec un autrer
    save_path: PathBuf,
}


impl GameEngine {
    pub fn new(notify: Arc<Notify>, save_path: PathBuf) -> Self {
        let mut states = GameState::new();

        states.progression = progression::persistence::load(&save_path);
        states.player = player::persistence::load(&save_path);
        states.map = world::persistence::load(&save_path);

        // `Map::explored` n'est pas persisté (seule la progression l'est) : on
        // réapplique l'effet des paliers déjà achetés pour que la carte visible
        // reste cohérente avec la sauvegarde après un redémarrage.
        let exploration_tier = states.progression.tier(Unlockable::ExplorationRadius);
        if let Some(radius) = Unlockable::ExplorationRadius.reveal_radius_at_tier(exploration_tier) {
            if let Some(camp) = states.map.camp() {
                states.map.reveal(camp, radius);
            }
        }

        states.inventory.player.add(Resource::Fiber, 1000);
        states.inventory.player.add(Resource::Wood, 1000);

        Self {
            states,
            gather_system: GatherSystem::new(),
            move_system: MoveSystem::new(),
            transfer_system: TransferInventorySystem::new(),
            craft_system: CraftSystem::new(),
            progression_system: ProgressionSystem::new(),
            events: Vec::new(),
            notify,
            save_path,
        }
    }
    
    pub fn drain_events(&mut self) -> Vec<Event>{
        take(&mut self.events)
    }

    pub fn execute(&mut self, command: Command) -> CommandOutput{
        let SystemOutcome { output, events } = match command {
            Command::Gather => {
                SystemOutcome::output(CommandOutput::GatherOptions(self.gather_system.propose(&mut self.states)))
            },
            Command::GatherSelect { resource } => {
                let (options, events) = self.gather_system.select(resource, &mut self.states);
                SystemOutcome::both(CommandOutput::GatherOptions(options), events)
            },
            Command::GetMap => {
                SystemOutcome::output(CommandOutput::Map(self.states.map.to_view()))
            },
            Command::GetTerrain => {
                SystemOutcome::output(CommandOutput::Terrain(Terrain::view()))
            },
            Command::GetRecipes => {
                SystemOutcome::output(CommandOutput::Recipes(Recipe::view()))
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
            Command::Purchase { payload } => {
                let outcome = self.progression_system.purchase(payload.unlockable, payload.inventory, &mut self.states);
                let mut events = outcome.events;

                if let Some(UnlockEffect::RevealMap { radius }) = outcome.effect {
                    if let Some(camp) = self.states.map.camp() {
                        self.states.map.reveal(camp, radius);
                        events.push(Event::MapUpdated { changes: self.states.map.to_view() });
                        if let Err(err) = world::persistence::save(&self.save_path, &self.states.map) {
                            eprintln!("progression save failed: {err}");
                        }
                    }
                }

                SystemOutcome::events(events)
            },
            Command::GetInventory {name} => {
                SystemOutcome::output(CommandOutput::Inventory(
                    self.states.inventory.get_by_name(
                        name.as_str()
                    ).unwrap_or(&Inventory::new(name))
                        .to_view()
                ))
            },
            Command::GetProgression => {
                SystemOutcome::output(CommandOutput::Progression(self.states.progression.to_view()))
            },
            Command::ResetSave => {
                saver::reset(&*self.save_path, PROGRESSION_SAVE_NAME);
                self.states.progression = progression::persistence::load(&self.save_path);

                saver::reset(&*self.save_path, PLAYER_SAVE_NAME);
                self.states.player = player::persistence::load(&self.save_path);

                saver::reset(&*self.save_path, WOLD_SAVE_NAME);
                self.states.map = world::persistence::load(&self.save_path);

                SystemOutcome::output(CommandOutput::None)

            }
        };

        if events.iter().any(|event| matches!(event, Event::ProgressionUpdated { .. })) {
            if let Err(err) = progression::persistence::save(&self.save_path, &self.states.progression) {
                eprintln!("progression save failed: {err}");
            }
        }

        if events.iter().any(|event| matches!(event, Event::MovePath { .. })) {
            if let Err(err) = player::persistence::save(&self.save_path, &self.states.player) {
                eprintln!("player save failed: {err}");
            }
        }

        if !events.is_empty() {
            self.events.extend(events);
            self.notify.notify_one();
        }

        output
    }

    //fn tick() un genre d'update general en boucle infini qui lance des events

    //fn scheduler() un genre de timer qui lance aussi des events
}