use crate::resource::{LootEntry, Resource};

/// Un gisement de ressource qu'une `Tile` peut porter (voir `world::tile::Tile::nodes`).
/// Remplace l'ancien couple `Area`/`AreaType` : la géométrie de clic (position, forme)
/// a disparu avec le système de zones cliquables — il ne reste que l'identité du
/// gisement et sa table de loot statique.
#[derive(Copy, Clone, Debug)]
pub enum ResourceNode {
    Grass,
    Rock,
    Tree,
    Bush,
    OreVein,
    Crystal,
    Mushroom,
    Flower,
}

impl ResourceNode {
    pub fn loot(&self) -> &'static [LootEntry] {
        match self {
            ResourceNode::Grass => &[
                LootEntry { resource: Resource::Grass, infallible: 1, bonus_max: 5, chance: 0.2 },
                LootEntry { resource: Resource::Wood, infallible: 0, bonus_max: 2, chance: 0.1 },
            ],
            ResourceNode::Rock => &[
                LootEntry { resource: Resource::Stone, infallible: 1, bonus_max: 3, chance: 0.2 },
                LootEntry { resource: Resource::IronOre, infallible: 0, bonus_max: 1, chance: 0.05 },
            ],
            ResourceNode::Tree => &[
                LootEntry { resource: Resource::Wood, infallible: 1, bonus_max: 3, chance: 0.4 },
            ],
            ResourceNode::Bush => &[
                LootEntry { resource: Resource::Berry, infallible: 1, bonus_max: 4, chance: 0.3 },
            ],
            ResourceNode::OreVein => &[
                LootEntry { resource: Resource::Stone, infallible: 1, bonus_max: 2, chance: 0.2 },
                LootEntry { resource: Resource::IronOre, infallible: 0, bonus_max: 2, chance: 0.35 },
            ],
            ResourceNode::Crystal => &[
                LootEntry { resource: Resource::Crystal, infallible: 0, bonus_max: 1, chance: 0.5 },
            ],
            ResourceNode::Mushroom => &[
                LootEntry { resource: Resource::Mushroom, infallible: 1, bonus_max: 3, chance: 0.3 },
            ],
            ResourceNode::Flower => &[
                LootEntry { resource: Resource::Flower, infallible: 1, bonus_max: 3, chance: 0.3 },
            ],
        }
    }
}
