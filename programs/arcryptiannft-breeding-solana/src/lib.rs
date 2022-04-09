use anchor_lang::prelude::*;

mod env;
use env::*;

mod contexts;
use contexts::*;

use anchor_spl::token::{
    self,
    Transfer,
};


declare_id!("7MFw3o88qjGDRcvXr217A54cMp3chWi5qF2fng1qWshU");

#[program]
pub mod arcryptiannft_breeding_solana {
    use super::*;

    pub fn initialize(ctx: Context<InitializeBreeding>) -> Result<()> {
        let breeding = &mut ctx.accounts.breeding;
        breeding.authority= ctx.accounts.authority.key().clone();
        breeding.timestamp = ctx.accounts.clock.unix_timestamp as u64;
        breeding.is_breeding = false;
        breeding.is_male_locked = false;
        breeding.is_female_locked = false;
        breeding.allowed_collection_address = crate::ADULT_CANDY_MACHINE_ADDRESS.parse::<Pubkey>().unwrap();

        Ok(())
    }

    pub fn start(ctx: Context<StartBreeding>) -> Result<()> {
        
        let breeding = &mut ctx.accounts.breeding;
        
        if breeding.is_breeding == true {
            msg!("Breeding is already started.");
            return Ok(());
        }

        if breeding.is_male_locked == false {
            let cpi_accounts = Transfer {
                to: ctx.accounts.male_lock_account.to_account_info(),
                from: ctx.accounts.male_user_wallet.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program_id.clone();

            let context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(context, 1)?;

            breeding.is_male_locked = true;

        }
        if breeding.is_female_locked == false {
            let cpi_accounts = Transfer {
                to: ctx.accounts.female_lock_account.to_account_info(),
                from: ctx.accounts.female_user_wallet.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program_id.clone();

            let context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(context, 1)?;

            breeding.is_female_locked = true;
        }

        let current_timestamp = ctx.accounts.clock.unix_timestamp as u64;
        breeding.timestamp = current_timestamp;

        if breeding.is_male_locked && breeding.is_female_locked {
            breeding.is_breeding = true;
        } else {
            msg!("Adult nft lock is failed");
        }
        
        Ok(())
    }

    pub fn finish(ctx: Context<FinishBreeding>, breeding_bump: u8) -> Result<()> {
        
        let breeding = &mut ctx.accounts.breeding;

        if breeding.is_breeding == false {
            msg!("Breeding is not started.");
            return Ok(());
        }

        if breeding.is_male_locked == true {
            let cpi_accounts = Transfer {
                to: ctx.accounts.male_user_wallet.to_account_info(),
                from: ctx.accounts.male_lock_account.to_account_info(),
                authority: breeding.clone().to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program_id.clone();
            
            let context = CpiContext::new(cpi_program, cpi_accounts);
            let authority_seeds = &[
                breeding.authority.as_ref(),
                &BREEDING_SEED[..],
                &[breeding_bump]
            ];

            token::transfer(context.with_signer(&[&authority_seeds[..]]), 1)?;

            breeding.is_male_locked = false;
        }
        if breeding.is_female_locked == true {
            let cpi_accounts = Transfer {
                to: ctx.accounts.female_user_wallet.to_account_info(),
                from: ctx.accounts.female_lock_account.to_account_info(),
                authority: breeding.clone().to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program_id.clone();

            let context = CpiContext::new(cpi_program, cpi_accounts);
            let authority_seeds = &[
                breeding.authority.as_ref(),
                &BREEDING_SEED[..],
                &[breeding_bump]
            ];

            token::transfer(context.with_signer(&[&authority_seeds[..]]), 1)?;

            breeding.is_female_locked = true;
        }

        let current_timestamp = ctx.accounts.clock.unix_timestamp as u64;
        breeding.timestamp = current_timestamp;

        if !breeding.is_male_locked && !breeding.is_female_locked {
            breeding.is_breeding = false;
        } else {
            msg!("Adult nft unlock is failed");
        }
        
        Ok(())
    }
}
