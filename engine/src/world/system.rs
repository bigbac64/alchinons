use crate::state::GameState;
use crate::world::tile::Tile;

pub struct TileSystem {}


impl TileSystem {
    pub fn exploitable(x: usize, y: usize, states: &GameState) -> bool {
        states.world.tiles
            .get(x)
            .and_then(|row| row.get(y))
            .is_some_and(|tile| !tile.is_down())
    }

    pub fn exploit(x: usize, y: usize, states: &mut GameState) -> bool{
        if TileSystem::exploitable(x, y, states){
            states.world.tiles[x][y].forward();
            return true
        }
        false
    }

    pub fn exploitable_player_position(states: &mut GameState) -> bool {
        let p = states.player.player.position;
        TileSystem::exploitable(p.x as usize, p.y as usize, states)
    }
    pub fn exploit_player_position(states: &mut GameState) -> bool {
        let p = states.player.player.position;
        TileSystem::exploit(p.x as usize, p.y as usize, states)
    }
}