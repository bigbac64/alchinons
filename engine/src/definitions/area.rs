use serde::Serialize;
use crate::definitions::position::Position;
use crate::definitions::resources::{LootEntry, Resource};
use crate::definitions::terrain::{Terrain};
use crate::views::area::{AreaView, ShapeView, TileView};

const GRASS: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[LootEntry{
            resource: Resource::Grass,
            infallible: 1,
            bonus_max: 5,
            chance: 0.2,
        },
        LootEntry{
            resource: Resource::Wood,
            infallible: 0,
            bonus_max: 2,
            chance: 0.1,
        }
    ],
    label: "Herbes",
    color: "#4f7a34",
};

const ROCK: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[LootEntry{
            resource: Resource::Grass,
            infallible: 1,
            bonus_max: 3,
            chance: 0.2,
        },
        LootEntry{
            resource: Resource::Stone,
            infallible: 0,
            bonus_max: 1,
            chance: 0.6,
        }
    ],
    label: "Roches",
    color: "#808080",
};

const WATER: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[],
    label: "Eau",
    color: "#0000ff",
};

const SKY: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[],
    label: "Ciel",
    color: "#ffffff",
};

const TREE: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[LootEntry{
            resource: Resource::Wood,
            infallible: 1,
            bonus_max: 3,
            chance: 0.4,
        }
    ],
    label: "Arbre",
    color: "#008000",
};

const BUSH: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[LootEntry{
            resource: Resource::Berry,
            infallible: 1,
            bonus_max: 4,
            chance: 0.3,
        }
    ],
    label: "Buisson",
    color: "#3f6b2f",
};

// sol neutre (campement, ...) : pas de loot, juste de quoi couvrir la tile visuellement
const GROUND: AreaTypeDefinition = AreaTypeDefinition {
    loot: &[],
    label: "Sol",
    color: "#6b5842",
};

#[derive(Copy, Clone, Debug)]
pub enum Shape {
    Rectangle {
        width:u32,
        height:u32
    },

    Circle {
        radius:u32
    }
}

impl Shape {
    /// `origin` et `point` sont dans le même repère (celui de la tile : 0..400, ancrage haut-gauche).
    pub fn contains(&self, origin: Position, point: Position) -> bool {
        match *self {
            Shape::Rectangle { width, height } => {
                point.x >= origin.x && point.x < origin.x + width
                    && point.y >= origin.y && point.y < origin.y + height
            }
            Shape::Circle { radius } => {
                let dx = point.x as i64 - origin.x as i64;
                let dy = point.y as i64 - origin.y as i64;
                dx * dx + dy * dy <= (radius as i64) * (radius as i64)
            }
        }
    }

    fn to_view(&self) -> ShapeView {
        match *self {
            Shape::Rectangle { width, height } => ShapeView::Rectangle { width, height },
            Shape::Circle { radius } => ShapeView::Circle { radius },
        }
    }
}

#[derive(Copy, Clone, Debug)]
pub enum AreaType {
    Grass,
    Rock,
    Water,
    Sky,
    Tree,
    Bush,
    Ground,
}

impl AreaType {
    pub fn definition(&self) -> &'static AreaTypeDefinition{
        match self {
            AreaType::Grass => &GRASS,
            AreaType::Rock => &ROCK,
            AreaType::Water => &WATER,
            AreaType::Sky => &SKY,
            AreaType::Tree => &TREE,
            AreaType::Bush => &BUSH,
            AreaType::Ground => &GROUND,
        }
    }
}


pub struct Area {
    hitbox: Shape,
    area_type: AreaType,
    position: Position,
}

impl Area {
    /// `point` est exprimé dans le repère local de la tile (0..400, ancrage haut-gauche),
    /// comme `Area::position`. La conversion depuis un clic écran/carte vers ce repère
    /// reste à faire côté appelant (pas encore de commande branchée dessus).
    pub fn contains(&self, point: Position) -> bool {
        self.hitbox.contains(self.position, point)
    }

    pub fn loot(&self) -> &'static [LootEntry] {
        self.area_type.definition().loot
    }

    fn to_view(&self) -> AreaView {
        let definition = self.area_type.definition();
        AreaView {
            area_type: format!("{:?}", self.area_type).to_lowercase(),
            label: definition.label.to_string(),
            color: definition.color.to_string(),
            position: self.position,
            shape: self.hitbox.to_view(),
        }
    }
}

#[derive(Serialize)]
pub struct AreaTypeDefinition {
    pub loot: &'static [LootEntry],
    pub label: &'static str,
    pub color: &'static str,
}

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
    /// qui y sera figée pour toute la durée de vie de la partie (voir `ecs::map::Map`).
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

// TODO: le loot de `TerrainDefinition` (terrain.rs) et celui des `Area` d'une Tile
//      font aujourd'hui doublon : `Gather` tire toujours sur le Terrain de la case
//      entière. Migrer vers un loot par Area cliquée impliquera de faire porter à
//      `Command::Gather` la position cliquée (ou l'Area visée), puis de retirer
//      `loot` de `TerrainDefinition` une fois la bascule faite des deux côtés.