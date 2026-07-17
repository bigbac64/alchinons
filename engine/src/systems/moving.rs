use crate::definitions::position::Position;
use crate::events::Event;
use crate::services::pathfinding::{hex_distance, search};
use crate::states::GameState;

pub struct MoveSystem {
    
}


impl MoveSystem {
    pub fn new() -> Self {
        Self {}
    }
    
    pub fn execute(&mut self, destination: Position, states: &mut GameState) -> Vec<Event> {
        match search(states.player.player.position, destination, &states.map.matrix_cost(), hex_distance) {
            Some(path) => {
                states.player.player.position = *path.last().unwrap();
                vec![Event::MovePath { path }]
            }
            None => { vec![] }
        }
    }
}