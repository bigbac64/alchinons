use crate::definitions::terrain::Terrain;
use crate::definitions::terrain::Terrain::*;

pub const MAP_LAYOUT: [[Terrain; 11]; 10] = [
    [Void,  Void,   Void,  Void,  Void,  Void,  Void,  Void,  Void,  Void,  Void],
    [Void,  Cliff,  Plain, Plain, Forest,Plain, Plain, Forest,Plain, Cliff, Void],
    [Void,  Plain,  Forest,Forest,Plain, Plain, Forest,Plain, Plain, Plain, Void],
    [Void,  Plain,  Forest,Water, Water, Plain, Plain, Plain, Forest,Plain, Void],
    [Void,  Plain,  Plain, Water, Camp,  Plain, Plain, Plain, Forest,Plain, Void],
    [Void,  Plain,  Plain, Plain, Plain, Plain, Water, Plain, Plain, Plain, Void],
    [Void,  Forest, Plain, Plain, Plain, Water, Water, Plain, Forest,Plain, Void],
    [Void,  Plain,  Forest,Plain, Plain, Plain, Plain, Plain, Plain, Plain, Void],
    [Void,  Cliff,  Plain, Forest,Plain, Plain, Forest,Plain, Cliff, Cliff, Void],
    [Void,  Void,   Void,  Void,  Void,  Void,  Void,  Void,  Void,  Void,  Void],
];