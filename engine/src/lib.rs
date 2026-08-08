
pub mod position;
pub mod resource;
pub mod state;
pub mod engine;
pub mod events;
pub mod commands;

pub mod player;
pub mod craft;
pub mod inventory;
pub mod world;
pub mod movement;
pub mod gather;
pub mod progression;
pub mod saver;

#[cfg(test)]
mod tests {

    #[test]
    fn it_works() {
        assert_eq!("result.name,", "result.name,");
    }
}
