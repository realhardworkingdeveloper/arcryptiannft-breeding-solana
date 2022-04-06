use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use std::ops::Deref;

#[derive(Accounts)]
pub struct InitializeBreeding<'info> {
    #[account(
        init,
        seeds = [authority.key().as_ref()],
        bump,
        payer = authority,
        space = Breeding::space(),
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(
        mut,
        seeds = [b"male"],
        bump,
        constraint = male_lock_account
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub male_lock_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"female"],
        bump,
        constraint = female_lock_account
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub female_lock_account: Account<'info, TokenAccount>,


    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[account]
pub struct Breeding {
    // space 8 + 1
    pub authority: Pubkey,
    pub timestamp: u64,     // 8
    pub is_breeding: bool,  // 1
}

impl Breeding {
    fn space() -> usize {
        // discriminator
        8 +
        // Pubkey
        32 +
        // u64
        8 +
        // bool
        1     
    }
}