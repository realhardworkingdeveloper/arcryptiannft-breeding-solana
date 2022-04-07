use anchor_lang::prelude::*;
use anchor_spl::token::{
    TokenAccount,
    Mint,
};
use std::ops::Deref;

#[derive(Accounts)]
#[instruction(
    _breeding_bump: u8,
)]
pub struct InitializeBreeding<'info> {
    #[account(
        mut,
        seeds = [
            authority.key().as_ref(),
            crate::BREEDING_SEED.as_ref(),
        ],
        bump = _breeding_bump,
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[derive(Accounts)]
#[instruction(
    _breeding_bump: u8,
)]
pub struct StartBreeding<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            authority.key().as_ref(),
            crate::BREEDING_SEED.as_ref(),
        ],
        bump = _breeding_bump,
    )]
    pub breeding: Account<'info, Breeding>,

    #[account(mut)]
    pub nft_token_mint: Box<Account<'info, Mint>>,

    #[account(
        constraint = nft_token_metadata.owner
            == &adult_nft_program_id.key(),
    )]
    pub nft_token_metadata: AccountInfo<'info>, 

    #[account(
        mut,
        constraint = lock_account
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub lock_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_wallet.clone().into_inner().deref().owner 
            == authority.key(),
        constraint = user_wallet.clone().into_inner().deref().mint 
            == nft_token_mint.key(),
    )]
    pub user_wallet: Box<Account<'info, TokenAccount>>,

    #[account(
        constraint = allowed_collection_address.key() 
            == breeding.allowed_collection_address,
        constraint = user_wallet.clone().into_inner().deref().mint 
            == nft_token_mint.key(),
    )]
    pub allowed_collection_address: AccountInfo<'info>,

    #[account(
        constraint = 
            token_program.key() == crate::TOKEN_PROGRAM_BYTES.parse::<Pubkey>().unwrap(),
    )]
    pub token_program: AccountInfo<'info>,

    #[account(
        constraint = 
        adult_nft_program_id.key() == 
            crate::ADULT_NFT_PROGRAM_BYTES.parse::<Pubkey>().unwrap(),
    )]
    pub adult_nft_program_id: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info,Clock>,
}

#[derive(Accounts)]
pub struct FinishBreeding<'info> {
    #[account(mut)]
    pub breeding: Account<'info, Breeding>,

    #[account(
        mut,
        seeds = [authority.key().as_ref(), b"male"],
        bump,
        constraint = male_lock_account
         .clone().into_inner().deref().owner == authority.key(),
    )]
    pub male_lock_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [authority.key().as_ref(), b"female"],
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

    // this address is being checked as a verified creator of nft
    pub allowed_collection_address: Pubkey
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