use serde::Deserialize;
use crate::commands::StructCommand;
use crate::commands::outcome::{CommandOutput, Outcome};
use crate::events::Event;
use crate::progression::system;
use crate::progression::unlockable::{Unlockable, UnlockEffect};
use crate::state::GameState;

#[derive(Deserialize)]
pub struct PurchasePayload {
    pub unlockable: Unlockable,
    pub inventory: String,
}

impl StructCommand for PurchasePayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        let outcome = system::purchase(self.unlockable, self.inventory, states);
        let mut events = outcome.events;

        // `RevealMap` est le seul effet cross-domaine d'un achat : on lit ici
        // `states.world.map` via son API publique (`camp`/`reveal`), pas son
        // état interne — cf. ARCHITECTURE_GUIDELINES §2.3. La persistance de
        // `world` déclenchée par `Event::MapUpdated` est gérée génériquement
        // par `GameEngine::persist_on_events`, pas ici.
        if let Some(UnlockEffect::RevealMap { radius }) = outcome.effect {
            if let Some(camp) = states.world.map.camp() {
                states.world.map.reveal(camp, radius);
                events.push(Event::MapUpdated { changes: states.world.map.to_view() });
            }
        }

        Outcome::events(events)
    }
}

#[derive(Deserialize)]
pub struct GetProgressionPayload;

impl StructCommand for GetProgressionPayload {
    fn execute(self, states: &mut GameState) -> Outcome {
        Outcome::output(CommandOutput::Progression(states.progression.to_view()))
    }
}
