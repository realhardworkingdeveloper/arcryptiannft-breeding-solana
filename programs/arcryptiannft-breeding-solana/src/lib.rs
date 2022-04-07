use anchor_lang::prelude::*;

mod env;
use env::*;

mod contexts;
use contexts::*;

use anchor_spl::token::{
    self,
    Transfer,
};


declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod arcryptiannft_breeding_solana {
    use super::*;

    pub fn initialize(ctx: Context<InitializeBreeding>) -> Result<()> {
        let breeding = &mut ctx.accounts.breeding;
        breeding.authority= ctx.accounts.authority.key().clone();
        breeding.timestamp = ctx.accounts.clock.unix_timestamp as u64;
        breeding.is_breeding = false;
        
        Ok(())
    }

    // pub fn start(ctx: Context<StartBreeding>) -> Result<()> {
        
    //     let breeding = &mut ctx.accounts.breeding;

    //     if breeding.is_breeding == true {
    //         msg!("Breeding is already started.");
    //         return Ok(());
    //     }

    //     let current_timestamp = ctx.accounts.clock.unix_timestamp as u64;
        // update_reward_pool(
        //     current_timestamp,
        //     staking_instance,
        //     user_instance,
        // );

        // let cpi_accounts = Transfer {
        //     to: ctx.accounts.lock_account.to_account_info(),
        //     from: ctx.accounts.user_wallet.to_account_info(),
        //     authority: ctx.accounts.authority.to_account_info(),
        // };
        // let cpi_program = ctx.accounts.token_program.clone();
        // let context = CpiContext::new(cpi_program, cpi_accounts);
        // token::transfer(context, 1)?;

        // user_instance.deposited_amount = user_instance
        //     .deposited_amount
        //     .checked_add(1)
        //     .unwrap();
        // staking_instance.total_shares = staking_instance
        //     .total_shares
        //     .checked_add(1)
        //     .unwrap();
        // update_reward_debt(
        //     staking_instance,
        //     user_instance,
        // );
        
    //     Ok(())
    // }
}
