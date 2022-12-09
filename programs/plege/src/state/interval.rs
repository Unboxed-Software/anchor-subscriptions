use anchor_lang::prelude::borsh;
use borsh::{BorshDeserialize, BorshSerialize};
use chrono::*;

#[derive(Copy, Clone, BorshDeserialize, BorshSerialize)]
pub enum Interval {
    Month,
    Year,
}

impl Interval {
    pub fn grace_period(self) -> i64 {
        24 * 60 * 60
    }

    pub fn max_approval_len(self) -> u64 {
        match self {
            Interval::Month => 60,
            Interval::Year => 6,
        }
    }

    pub fn increment(self, current: i64) -> i64 {
        let start = NaiveDateTime::from_timestamp_opt(current, 0).unwrap();

        match self {
            Interval::Month => start
                .checked_add_months(Months::new(1))
                .unwrap()
                .timestamp(),
            Interval::Year => start
                .checked_add_months(Months::new(12))
                .unwrap()
                .timestamp(),
        }
    }
}
