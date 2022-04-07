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
                to: ctx.accounts.lock_account.to_account_info(),
                from: ctx.accounts.user_wallet.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program.clone();

            let context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(context, 1)?;

            breeding.is_male_locked = true;

            return Ok(());
        } else if breeding.is_female_locked == false {
            let cpi_accounts = Transfer {
                to: ctx.accounts.lock_account.to_account_info(),
                from: ctx.accounts.user_wallet.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program.clone();

            let context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(context, 1)?;

            breeding.is_female_locked = true;

            return Ok(());
        }

        let current_timestamp = ctx.accounts.clock.unix_timestamp as u64;
        breeding.timestamp = current_timestamp;
        breeding.is_breeding = true;
        
        Ok(())
    }

    // pub fn finish(ctx: Context<FinishBreeding>) -> Result<()> {
        
    //     let breeding = &mut ctx.accounts.breeding;

    //     if breeding.is_breeding == false {
    //         msg!("Breeding is not started.");
    //         Ok(())
    //     }

    //     if breeding.is_male_locked == true {
    //         let cpi_accounts = Transfer {
    //             to: ctx.accounts.lock_account.to_account_info(),
    //             from: ctx.accounts.user_wallet.to_account_info(),
    //             authority: ctx.accounts.authority.to_account_info(),
    //         };

    //         let cpi_program = ctx.accounts.token_program.clone();

    //         let context = CpiContext::new(cpi_program, cpi_accounts);
    //         token::transfer(context, 1)?;

    //         breeding.is_male_locked = true;

    //         Ok(())
    //     } else if breeding.is_female_locked == false {
    //         let cpi_accounts = Transfer {
    //             to: ctx.accounts.lock_account.to_account_info(),
    //             from: ctx.accounts.user_wallet.to_account_info(),
    //             authority: ctx.accounts.authority.to_account_info(),
    //         };

    //         let cpi_program = ctx.accounts.token_program.clone();

    //         let context = CpiContext::new(cpi_program, cpi_accounts);
    //         token::transfer(context, 1)?;

    //         breeding.is_female_locked = true;

    //         Ok(())
    //     }

    //     let current_timestamp = ctx.accounts.clock.unix_timestamp as u64;
    //     breeding.timestamp = current_timestamp;
    //     breeding.is_breeding = true;
        
    //     Ok(())
    // }
}
