use anchor_lang::prelude::*;

mod contexts;
use contexts::*;

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
}
