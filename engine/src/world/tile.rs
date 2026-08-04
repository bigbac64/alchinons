use crate::resource::LootEntry;
use crate::world::resource_node::ResourceNode;
use crate::world::terrain::Terrain;

pub struct Tile {
    pub nodes: &'static [ResourceNode],
    pub terrain: Terrain,
}

const PLAIN_TILE_1: Tile = Tile {
    nodes: &[ResourceNode::Grass],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_2: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Rock],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_3: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Bush],
    terrain: Terrain::Plain,
};

// tile rare : parterre de fleurs, tirée avec une faible probabilité (voir pool())
const PLAIN_TILE_FLOWER: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Flower],
    terrain: Terrain::Plain,
};

const FOREST_TILE_1: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Tree],
    terrain: Terrain::Forest,
};

// tile rare : clairière à champignons, tirée avec une faible probabilité (voir pool())
const FOREST_TILE_MUSHROOM: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Mushroom],
    terrain: Terrain::Forest,
};

const FOREST_TILE_2: Tile = Tile {
    nodes: &[ResourceNode::Grass, ResourceNode::Tree, ResourceNode::Bush],
    terrain: Terrain::Forest,
};

// seule variante "rocher" du Cliff : les deux anciennes tiles CLIFF_TILE_1/2 ne se
// distinguaient que par la disposition visuelle des zones (même table de loot), une
// distinction qui n'a plus de sens sans géométrie de clic — voir pool() pour la
// pondération conservée via une double référence à cette même tile.
const CLIFF_TILE_ROCK: Tile = Tile {
    nodes: &[ResourceNode::Rock],
    terrain: Terrain::Cliff,
};

const CLIFF_TILE_IRON: Tile = Tile {
    nodes: &[ResourceNode::Rock, ResourceNode::OreVein],
    terrain: Terrain::Cliff,
};

// tile rare : filon de cristal, tirée avec une faible probabilité (voir pool())
const CLIFF_TILE_CRYSTAL: Tile = Tile {
    nodes: &[ResourceNode::Rock, ResourceNode::Crystal],
    terrain: Terrain::Cliff,
};

const WATER_TILE: Tile = Tile {
    nodes: &[],
    terrain: Terrain::Water,
};

const CAMP_TILE: Tile = Tile {
    nodes: &[],
    terrain: Terrain::Camp,
};

const VOID_TILE: Tile = Tile {
    nodes: &[],
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

    /// Concatène les tables de loot de tous les gisements de cette tile (une tile peut
    /// combiner plusieurs `ResourceNode`, ex. Grass + Rock) en une seule liste consommée
    /// par `Looting::generate`.
    pub fn loot_pool(&self) -> Vec<LootEntry> {
        self.nodes.iter().flat_map(|node| node.loot().iter().copied()).collect()
    }
}
