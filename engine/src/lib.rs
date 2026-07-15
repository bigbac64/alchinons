
pub mod definitions;
pub mod ecs;
pub mod systems;
pub mod states;
pub mod engine;
pub mod events;
pub mod commands;
pub mod views;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!("result.name,", "result.name,");
    }
}
