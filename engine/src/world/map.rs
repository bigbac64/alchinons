use serde::{Deserialize, Deserializer, Serialize, Serializer};
use crate::position::{hex_distance, Position};
use crate::world::layout::MAP_LAYOUT;
use crate::world::tile::Tile;
use crate::world::terrain::Terrain;
use crate::world::view::MapView;

fn serialize_tiles<S>(tiles: &Vec<Vec<&'static Tile>>,  serializer: S) -> Result<S::Ok, S::Error>
where S: Serializer {
    let ids: Vec<Vec<&str>> = tiles
        .iter()
        .map(|row| row.iter().map(|t| t.name).collect())
        .collect();
    ids.serialize(serializer)
}

fn deserialize_tiles<'de, D>(deserializer: D) -> Result<Vec<Vec<&'static Tile>>, D::Error>
where D: Deserializer<'de> {
    let names: Vec<Vec<String>> = Vec::deserialize(deserializer)?;
    names.into_iter()
        .map(|row| {
            row.into_iter()
                .map(|name| {
                    Tile::find_all(&name)
                        .ok_or_else(|| serde::de::Error::custom(format!("tile inconnu: {name}")))
                })
                .collect::<Result<Vec<_>, _>>()
        })
        .collect::<Result<Vec<_>, _>>()
}



#[derive(Serialize, Deserialize, Clone)]
pub struct Map {
    pub(crate) map: Vec<Vec<Terrain>>,
    #[serde(serialize_with = "serialize_tiles", deserialize_with = "deserialize_tiles")]
    pub(crate) tiles: Vec<Vec<&'static Tile>>,
    pub(crate) explored: Vec<Vec<bool>>,
    pub(crate) camp: Option<Position>,
}

impl Default for Map {
    fn default() -> Self {
        Self::from_array(&MAP_LAYOUT)
    }
}


impl Map {
    pub fn new() -> Self {
        Self {
            map: vec![vec![Terrain::Void]],
            tiles: vec![vec![Self::pick_tile(Terrain::Void)]],
            explored: vec![vec![true]],
            camp: None,
        }
    }

    pub fn from_array<const ROWS: usize, const COLS: usize>(array: &[[Terrain; COLS]; ROWS]) -> Self {
        let map: Vec<Vec<Terrain>> = array.iter()
            .map(|row| row.iter()
                .map(|&cell| cell).collect())
            .collect();

        // Tirage figé une seule fois ici : chaque case garde ensuite la même Tile
        // pour toute la durée de vie de cette Map (get_tile ne re-tire jamais).
        let tiles = map.iter()
            .map(|row| row.iter()
                .map(|&terrain| Self::pick_tile(terrain))
                .collect())
            .collect();

        let explored = vec![vec![false; COLS]; ROWS];

        let mut instance = Self { map, tiles, explored, camp: None };
        instance.camp = instance.find_camp();

        // Brouillard initial : seul le camp (et son rayon direct) est visible au
        // démarrage — le reste se dévoile en cours de partie via `reveal`
        // (voir `progression::unlockable::Unlockable::ExplorationRadius`).
        if let Some(camp) = instance.camp {
            instance.reveal(camp, 1);
        }

        instance
    }

    pub fn camp(&self) -> Option<Position> {
        self.camp
    }

    fn find_camp(&self) -> Option<Position> {
        self.map.iter().enumerate()
            .find_map(|(y, row)| row.iter().enumerate()
                .find_map(|(x, &terrain)| matches!(terrain, Terrain::Camp)
                    .then(|| Position { x: x as u32, y: y as u32 })))
    }

    /// Dévoile la carte autour d'une position sur un rayon donné (distance
    /// hexagonale, cases incluses). Purement additif : une case déjà explorée
    /// ne redevient jamais brouillard.
    pub fn reveal(&mut self, center: Position, radius: u32) {
        for (y, row) in self.explored.iter_mut().enumerate() {
            for (x, cell) in row.iter_mut().enumerate() {
                let position = Position { x: x as u32, y: y as u32 };
                if hex_distance(center, position) <= radius {
                    *cell = true;
                }
            }
        }
    }

    fn pick_tile(terrain: Terrain) -> &'static Tile {
        let pool = Tile::pool(terrain);
        pool[rand::random_range(0..pool.len())]
    }

    pub fn matrix_cost(&self) -> Vec<Vec<u32>> {
        self.map.iter()
            .map(|row| row.iter()
                .map(|&cell| {
                    let def = cell.definition();
                    if def.walkable {
                        def.movement_cost
                    } else {
                        0
                    }
                })
                .collect())
            .collect()
    }

    pub fn get_terrain(&self, position: Position) -> Option<Terrain> {
        self.map.get(position.y as usize)?.get(position.x as usize).copied()
    }

    pub fn get_tile(&self, position: Position) -> Option<&'static Tile> {
        self.tiles.get(position.y as usize)?.get(position.x as usize).copied()
    }

    pub fn to_view(&self) -> MapView {
        MapView {
            map: self.map.iter()
                .map(|row| row.iter()
                    .copied()
                    .map(|cell| format!("{:?}", cell).to_lowercase())
                    .collect()).
                collect(),
            explored: self.explored.clone(),
        }
    }

    pub(crate) fn clone(&self) -> Map {
        Map {
            map: self.map.clone(),
            tiles: self.tiles.clone(),
            explored: self.explored.clone(),
            camp: self.camp()
        }
    }
}