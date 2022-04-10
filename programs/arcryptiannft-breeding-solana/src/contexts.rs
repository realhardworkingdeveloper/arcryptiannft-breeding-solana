use anchor_lang::prelude::*;
use anchor_spl::token::{
    TokenAccount,
    Mint,
};
use std::ops::Deref;

#[derive(Accounts)]
pub struct InitializeBreeding<'info> {
    #[account(
        init,
        seeds = [
            authority.key().as_ref(),
            crate::BREEDING_SEED.as_ref(),
        ],
        bump,
        payer = authority,
        space = Breeding::space(),
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[derive(Accounts)]
pub struct StartBreeding<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            authority.key().as_ref(),
            crate::BREEDING_SEED.as_ref(),
        ],
        bump,
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(
        mut,
        constraint = male_user_wallet
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub male_user_wallet: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = female_user_wallet
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub female_user_wallet: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub male_lock_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub female_lock_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub arc_from: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub arc_to: Box<Account<'info, TokenAccount>>,

    #[account(
        constraint = 
            token_program_id.key() == crate::TOKEN_PROGRAM_BYTES.parse::<Pubkey>().unwrap(),
    )]
    /// CHECK: 
    pub token_program_id: AccountInfo<'info>,

    #[account()]
    /// CHECK:
    pub adult_nft_program_id: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[derive(Accounts)]
pub struct FinishBreeding<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            authority.key().as_ref(),
            crate::BREEDING_SEED.as_ref(),
        ],
        bump,
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(
        mut,
        constraint = male_user_wallet
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub male_user_wallet: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = female_user_wallet
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub female_user_wallet: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub male_lock_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub female_lock_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub arc_from: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub arc_to: Box<Account<'info, TokenAccount>>,

    #[account(
        constraint = 
            token_program_id.key() == crate::TOKEN_PROGRAM_BYTES.parse::<Pubkey>().unwrap(),
    )]
    /// CHECK: 
    pub token_program_id: AccountInfo<'info>,

    #[account()]
    /// CHECK:
    pub adult_nft_program_id: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[account]
#[derive(Default)]
pub struct Breeding {
    // space 8 + 1
    pub authority: Pubkey,
    pub timestamp: u64,     // 8
    pub is_breeding: bool,  // 1
    pub is_male_locked: bool,   // 1
    pub is_female_locked: bool, // 1

    pub is_pay_start: bool,     // 1

    pub is_pay_breed: bool,     // 1

    // this address is being checked as a verified creator of nft
    pub male_nft_token_mint: Pubkey,
    pub female_nft_token_mint: Pubkey,
    pub male_img: String,
    pub female_img: String,
}

impl Breeding {
    fn space() -> usize {
        // discriminator
        8 +
        // Pubkey
        32 +
        // u64
        8 +
        // bools
        1 + 1 + 1 + 1 + 1 +
        // male_nft_token_mint
        32 +
        // female_nft_token_mint
        32 +
        100 +
        100
    }
}