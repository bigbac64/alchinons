use serde::Deserialize;

#[derive(Deserialize)]
pub enum Command {
    Gather,
    Move {
        direction: u32
    }
}
