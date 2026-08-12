use serde::{Deserialize, Serialize};

pub trait Resettable {
    fn is_down(&self) -> bool;
    fn forward(&mut self);
    fn reset(&mut self);
}


#[derive(Serialize, Deserialize, Default, Copy, Clone)]
pub struct Countdown {
    limit: usize,
    state: usize,
    resets: usize
}

impl Countdown {
    pub fn new(limit: usize) -> Self {
        Self { limit, state: 0, resets: 0 }
    }
}

impl Countdown {

    pub fn is_down(&self) -> bool {
        self.state >= self.limit
    }

    pub fn forward(&mut self) {
        if self.is_down() { return }
        self.state += 1;
    }

    pub fn reset(&mut self) {
        self.resets += 1;
        self.state = 0;
    }
}
