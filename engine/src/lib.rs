
pub mod definitions;
pub mod ecs;
pub mod systems;
pub mod states;
pub mod engine;
pub mod events;
pub mod commands;
pub mod views;
pub mod services;

#[cfg(test)]
mod tests {

    #[test]
    fn it_works() {
        assert_eq!("result.name,", "result.name,");
    }
}
