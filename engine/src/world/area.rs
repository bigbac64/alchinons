use serde::Serialize;
use crate::position::Position;
use crate::resource::{LootEntry, Resource};
use crate::world::view::{AreaView, ShapeView};

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

    pub(crate) fn to_view(&self) -> ShapeView {
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
    pub(crate) hitbox: Shape,
    pub(crate) area_type: AreaType,
    pub(crate) position: Position,
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

    pub(crate) fn to_view(&self) -> AreaView {
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
