use std::mem::take;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Notify;
pub use crate::commands::Command;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::events::Event;
use crate::state::GameState;
use crate::progression::unlockable::Unlockable;
use crate::resource::Resource;
use crate::{player, progression, saver, world};
use crate::player::persistence::PLAYER_SAVE_NAME;
use crate::progression::persistence::PROGRESSION_SAVE_NAME;
use crate::world::persistence::WOLD_SAVE_NAME;
use crate::world::system::TileSystem;

pub struct GameEngine {
    states: GameState,
    events: Vec<Event>,
    notify: Arc<Notify>, // Arc = partage l'objet avec un autrer
    save_path: PathBuf,
}


impl GameEngine {
    pub fn new(notify: Arc<Notify>, save_path: PathBuf) -> Self {
        let mut states = GameState::new();

        states.progression = progression::persistence::load(&save_path);
        states.player = player::persistence::load(&save_path);
        states.world = world::persistence::load(&save_path);

        // `Map::explored` n'est pas persisté (seule la progression l'est) : on
        // réapplique l'effet des paliers déjà achetés pour que la carte visible
        // reste cohérente avec la sauvegarde après un redémarrage.
        let exploration_tier = states.progression.tier(Unlockable::ExplorationRadius);
        if let Some(radius) = Unlockable::ExplorationRadius.reveal_radius_at_tier(exploration_tier) {
            if let Some(camp) = states.world.map.camp() {
                states.world.map.reveal(camp, radius);
            }
        }

        states.inventory.player.add(Resource::Fiber, 1000);
        states.inventory.player.add(Resource::Wood, 1000);

        Self {
            states,
            events: Vec::new(),
            notify,
            save_path,
        }
    }

    pub fn drain_events(&mut self) -> Vec<Event>{
        take(&mut self.events)
    }

    pub fn execute(&mut self, command: Command) -> CommandOutput{
        let Outcome { output, events } = match command {
            Command::ResetSave(_) => self.reset_save(),
            command => command.execute(&mut self.states),
        };

        self.persist_on_events(&events);

        if !events.is_empty() {
            self.events.extend(events);
            self.notify.notify_one();
        }

        output
    }
    fn reset_save(&mut self) -> Outcome {
        saver::reset(&*self.save_path, PROGRESSION_SAVE_NAME);
        self.states.progression = progression::persistence::load(&self.save_path);

        saver::reset(&*self.save_path, PLAYER_SAVE_NAME);
        self.states.player = player::persistence::load(&self.save_path);

        saver::reset(&*self.save_path, WOLD_SAVE_NAME);
        self.states.world = world::persistence::load(&self.save_path);

        Outcome::output(CommandOutput::None)
    }

    /// Sauvegarde les domaines dont un `Event` signale un changement. Découplé
    /// du routage des `Command` (cf. `execute`) : ajouter un domaine persistant
    /// de plus ne demande de toucher qu'à cette fonction, jamais au dispatch.
    fn persist_on_events(&mut self, events: &[Event]) {
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

        if events.iter().any(|event| matches!(event, Event::InventoryUpdated { .. })) {
            if TileSystem::exploitable_player_position(&mut self.states){
                if let Err(err) = world::persistence::save(&self.save_path, &self.states.world) {
                    eprintln!("world save failed: {err}");
                }
            }
        }

        if events.iter().any(|event| matches!(event, Event::MapUpdated { .. })) {
            if let Err(err) = world::persistence::save(&self.save_path, &self.states.world) {
                eprintln!("world save failed: {err}");
            }
        }
    }

    //fn tick() un genre d'update general en boucle infini qui lance des events

    //fn scheduler() un genre de timer qui lance aussi des events
}
