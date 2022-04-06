use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct InitializeBreeding<'info> {
    #[account(
        init,
        seeds = [authority.key().as_ref()],
        bump,
        payer = authority,
        space = 320,
    )]
    breeding: Account<'info, Breeding>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Breeding {
    timestamp: String,
    is_breeding: bool,
}

// impl Breeding {
//     fn len(&self) -> usize {
//         let len = 
//     }
// }