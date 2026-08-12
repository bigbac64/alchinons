use crate::resource::{LootEntry, Resource};
use crate::world::terrain::Terrain;


pub struct Tile {
    pub name: &'static str,
    pub loots: &'static [LootEntry],
    pub terrain: Terrain,
}


/////////////  PLAIN  ///////////////////
const PLAIN_TILE_1: Tile = Tile {
    name: "plain_base",
    loots: &[
        LootEntry { resource: Resource::Grass, infallible: 1, bonus_max: 5, chance: 0.2 },
        LootEntry { resource: Resource::Wood, infallible: 0, bonus_max: 2, chance: 0.2 },
    ],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_2: Tile = Tile {
    name: "plain_rocked",
    loots: &[
        LootEntry { resource: Resource::Grass, infallible: 1, bonus_max: 4, chance: 0.27 },
        LootEntry { resource: Resource::Stone, infallible: 0, bonus_max: 1, chance: 0.6 },

    ],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_3: Tile = Tile {
    name: "plain_berry",
    loots: &[
        LootEntry { resource: Resource::Grass, infallible: 1, bonus_max: 6, chance: 0.18 },
        LootEntry { resource: Resource::Berry, infallible: 0, bonus_max: 3, chance: 0.8 },
        LootEntry { resource: Resource::Wood, infallible: 0, bonus_max: 1, chance: 0.4 },
    ],
    terrain: Terrain::Plain,
};

// tile rare : parterre de fleurs, tirée avec une faible probabilité (voir pool())
const PLAIN_TILE_FLOWER: Tile = Tile {
    name: "plain_flower",
    loots: &[
        LootEntry { resource: Resource::Grass, infallible: 1, bonus_max: 8, chance: 0.18 },
        LootEntry { resource: Resource::Flower, infallible: 0, bonus_max: 3, chance: 0.7 },
        LootEntry { resource: Resource::Stone, infallible: 0, bonus_max: 1, chance: 0.1 },

    ],
    terrain: Terrain::Plain,
};


const FOREST_TILE_1: Tile = Tile {
    name: "forest_base",
    loots: &[
        LootEntry { resource: Resource::Wood, infallible: 1, bonus_max: 4, chance: 0.18 },
        LootEntry { resource: Resource::Stone, infallible: 0, bonus_max: 1, chance: 0.1 },
    ],
    terrain: Terrain::Forest,
};

// tile rare : clairière à champignons, tirée avec une faible probabilité (voir pool())
const FOREST_TILE_MUSHROOM: Tile = Tile {
    name: "forest_mushroomed",
    loots: &[
        LootEntry { resource: Resource::Wood, infallible: 1, bonus_max: 4, chance: 0.18 },
        LootEntry { resource: Resource::Mushroom, infallible: 0, bonus_max: 3, chance: 0.3 },
    ],
    terrain: Terrain::Forest,
};

const FOREST_TILE_2: Tile = Tile {
    name: "forest_berry",
    loots: &[
        LootEntry { resource: Resource::Wood, infallible: 1, bonus_max: 4, chance: 0.18 },
        LootEntry { resource: Resource::Berry, infallible: 0, bonus_max: 5, chance: 0.15 },
    ],
    terrain: Terrain::Forest,
};

// seule variante "rocher" du Cliff : les deux anciennes tiles CLIFF_TILE_1/2 ne se
// distinguaient que par la disposition visuelle des zones (même table de loot), une
// distinction qui n'a plus de sens sans géométrie de clic — voir pool() pour la
// pondération conservée via une double référence à cette même tile.
const CLIFF_TILE_ROCK: Tile = Tile {
    name: "cliff_base",
    loots: &[
        LootEntry { resource: Resource::Stone, infallible: 1, bonus_max: 5, chance: 0.3 },
        LootEntry { resource: Resource::IronOre, infallible: 0, bonus_max: 3, chance: 0.25 },
    ],
    terrain: Terrain::Cliff,
};

const CLIFF_TILE_IRON: Tile = Tile {
    name: "cliff_rich",
    loots: &[
        LootEntry { resource: Resource::Stone, infallible: 0, bonus_max: 3, chance: 0.2 },
        LootEntry { resource: Resource::IronOre, infallible: 1, bonus_max: 4, chance: 0.25 },
    ],
    terrain: Terrain::Cliff,
};

// tile rare : filon de cristal, tirée avec une faible probabilité (voir pool())
const CLIFF_TILE_CRYSTAL: Tile = Tile {
    name: "cliff_crystal",
    loots: &[
        LootEntry { resource: Resource::Stone, infallible: 1, bonus_max: 3, chance: 0.1 },
        LootEntry { resource: Resource::Crystal, infallible: 1, bonus_max: 4, chance: 0.12 },
    ],
    terrain: Terrain::Cliff,
};

const WATER_TILE: Tile = Tile {
    name: "water_base",
    loots: &[],
    terrain: Terrain::Water,
};

const CAMP_TILE: Tile = Tile {
    name: "camp_base",
    loots: &[],
    terrain: Terrain::Camp,
};

const VOID_TILE: Tile = Tile {
    name: "_void",
    loots: &[],
    terrain: Terrain::Void,
};


impl Tile {
    /// Toutes les variantes de Tile possibles pour un type de Terrain donné.
    /// Utilisé à la génération de la Map pour tirer, une fois par case, la Tile
    /// qui y sera figée pour toute la durée de vie de la partie (voir `world::map::Map`).
    pub fn pool(terrain: Terrain) -> &'static [&'static Tile] {
        match terrain {
            Terrain::Void => &[&VOID_TILE],
            Terrain::Camp => &[&CAMP_TILE],
            // tirage uniforme (voir Map::pick_tile) : les tiles communes sont dupliquées
            // pour que PLAIN_TILE_FLOWER ne sorte qu'~1 fois sur 7 (rare, comme le champignon)
            Terrain::Plain => &[
                &PLAIN_TILE_1, &PLAIN_TILE_2, &PLAIN_TILE_3,
                &PLAIN_TILE_1, &PLAIN_TILE_2, &PLAIN_TILE_3,
                &PLAIN_TILE_FLOWER,
            ],
            // FOREST_TILE_MUSHROOM ~1/7 : même logique de rareté que la fleur
            Terrain::Forest => &[
                &FOREST_TILE_1, &FOREST_TILE_2,
                &FOREST_TILE_1, &FOREST_TILE_2,
                &FOREST_TILE_1, &FOREST_TILE_2,
                &FOREST_TILE_MUSHROOM,
            ],
            Terrain::Water => &[&WATER_TILE],
            // CLIFF_TILE_IRON (fer) est une tile courante ; CLIFF_TILE_CRYSTAL reste rare (~1/7)
            Terrain::Cliff => &[
                &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK,
                &CLIFF_TILE_IRON, &CLIFF_TILE_IRON,
                &CLIFF_TILE_CRYSTAL,
            ],
        }
    }

    pub fn all() -> &'static [&'static Tile] {
        &[
            &PLAIN_TILE_1, &PLAIN_TILE_2, &PLAIN_TILE_3,
            &PLAIN_TILE_1, &PLAIN_TILE_2, &PLAIN_TILE_3,
            &PLAIN_TILE_FLOWER,
            &FOREST_TILE_1, &FOREST_TILE_2,
            &FOREST_TILE_1, &FOREST_TILE_2,
            &FOREST_TILE_1, &FOREST_TILE_2,
            &FOREST_TILE_MUSHROOM,
            &WATER_TILE,
            &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK, &CLIFF_TILE_ROCK,
            &CLIFF_TILE_IRON, &CLIFF_TILE_IRON,
            &CLIFF_TILE_CRYSTAL,
            &VOID_TILE,
            &CAMP_TILE,
        ]
    }

    pub(crate) fn find_all(name: &str) -> Option<&'static Tile> {
        Tile::all().iter().copied().find(|t| t.name == name)
    }

    fn find(terrain: Terrain, name: &str) -> Option<&'static Tile> {
        Tile::pool(terrain).iter().copied().find(|t| t.name == name)
    }

    /// Concatène les tables de loot de tous les gisements de cette tile (une tile peut
    /// combiner plusieurs `ResourceNode`, ex. Grass + Rock) en une seule liste consommée
    /// par `Looting::generate`.
    pub fn loot_pool(&self) -> Vec<LootEntry> {
        self.loots.iter().map(|node| node.clone()).collect()
    }
}
