use crate::position::Position;
use crate::events::Event;
use crate::movement::utils::pathfinding::{hex_distance, search};
use crate::state::GameState;

pub fn moving_player(destination: Position, states: &mut GameState) -> Vec<Event> {
    match search(states.player.player.position, destination, &states.world.map.matrix_cost(), hex_distance) {
        Some(path) => {
            states.player.player.position = *path.last().unwrap();
            vec![Event::MovePath { path }]
        }
        None => { vec![Event::MoveFailed] }
    }
}
