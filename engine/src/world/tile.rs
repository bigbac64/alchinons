use crate::position::Position;
use crate::world::area::{Area, AreaType, Shape};
use crate::world::terrain::Terrain;
use crate::world::view::TileView;

pub struct Tile {
    pub areas: &'static [Area],
    pub terrain: Terrain,
}

// les tiles font 400x400 anchor en top left
const PLAIN_TILE_1: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Grass,
            position: Position{x: 0, y: 100},
            hitbox: Shape::Rectangle{width: 400, height: 300},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 100},
        },

    ],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_2: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Grass,
            position: Position{x: 0, y: 100},
            hitbox: Shape::Rectangle{width: 400, height: 280},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 120},
        },
        Area{
            area_type: AreaType::Rock,
            position: Position{x: 280, y: 240},
            hitbox: Shape::Circle{radius: 20},
        },
        Area{
            area_type: AreaType::Rock,
            position: Position{x: 60, y: 340},
            hitbox: Shape::Circle{radius: 16},
        },

    ],
    terrain: Terrain::Plain,
};

const PLAIN_TILE_3: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Grass,
            position: Position{x: 0, y: 100},
            hitbox: Shape::Rectangle{width: 400, height: 300},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 100},
        },
        Area{
            area_type: AreaType::Tree,
            position: Position{x: 220, y: 230},
            hitbox: Shape::Circle{radius: 30},
        },
    ],
    terrain: Terrain::Plain,
};

const FOREST_TILE_1: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Grass,
            position: Position{x: 0, y: 80},
            hitbox: Shape::Rectangle{width: 400, height: 320},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 80},
        },
        Area{
            area_type: AreaType::Tree,
            position: Position{x: 100, y: 200},
            hitbox: Shape::Circle{radius: 35},
        },
        Area{
            area_type: AreaType::Tree,
            position: Position{x: 290, y: 260},
            hitbox: Shape::Circle{radius: 28},
        },
    ],
    terrain: Terrain::Forest,
};

const FOREST_TILE_2: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Grass,
            position: Position{x: 0, y: 80},
            hitbox: Shape::Rectangle{width: 400, height: 320},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 80},
        },
        Area{
            area_type: AreaType::Tree,
            position: Position{x: 320, y: 180},
            hitbox: Shape::Circle{radius: 32},
        },
        Area{
            area_type: AreaType::Bush,
            position: Position{x: 110, y: 300},
            hitbox: Shape::Circle{radius: 24},
        },
    ],
    terrain: Terrain::Forest,
};

const CLIFF_TILE_1: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Rock,
            position: Position{x: 0, y: 120},
            hitbox: Shape::Rectangle{width: 400, height: 280},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 120},
        },
    ],
    terrain: Terrain::Cliff,
};

const CLIFF_TILE_2: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Rock,
            position: Position{x: 0, y: 120},
            hitbox: Shape::Rectangle{width: 400, height: 280},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 120},
        },
        Area{
            area_type: AreaType::Rock,
            position: Position{x: 110, y: 300},
            hitbox: Shape::Circle{radius: 25},
        },
        Area{
            area_type: AreaType::Rock,
            position: Position{x: 300, y: 340},
            hitbox: Shape::Circle{radius: 18},
        },
    ],
    terrain: Terrain::Cliff,
};

const WATER_TILE: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Water,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 400},
        },
    ],
    terrain: Terrain::Water,
};

const CAMP_TILE: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Ground,
            position: Position{x: 0, y: 100},
            hitbox: Shape::Rectangle{width: 400, height: 300},
        },
        Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 100},
        },
    ],
    terrain: Terrain::Camp,
};

const VOID_TILE: Tile = Tile {
    areas: &[Area{
            area_type: AreaType::Sky,
            position: Position{x: 0, y: 0},
            hitbox: Shape::Rectangle{width: 400, height: 400},
        },
    ],
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
            Terrain::Plain => &[&PLAIN_TILE_1, &PLAIN_TILE_2, &PLAIN_TILE_3],
            Terrain::Forest => &[&FOREST_TILE_1, &FOREST_TILE_2],
            Terrain::Water => &[&WATER_TILE],
            Terrain::Cliff => &[&CLIFF_TILE_1, &CLIFF_TILE_2],
        }
    }

    pub fn to_view(&self) -> TileView {
        TileView {
            terrain: format!("{:?}", self.terrain).to_lowercase(),
            areas: self.areas.iter().map(Area::to_view).collect(),
        }
    }
}
