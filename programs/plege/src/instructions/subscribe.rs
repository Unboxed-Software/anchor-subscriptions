    use anchor_lang::prelude::*;
    use anchor_spl::token::{approve, transfer, Approve, Token, TokenAccount, Transfer};
    use crate::instructions::{App, Tier};

    #[account]
    pub struct Subscription {
       pub app: Pubkey,
       pub tier: Pubkey,
       pub subscriber: Pubkey,
       pub expires: i64,
    }

    #[derive(Accounts)]
    pub struct Subscribe<'info> {
        #[account(mut)]
        pub app: Account<'info, App>,
        #[account(mut,
            constraint = tier.app == app.key(),
            seeds = [b"tier", app.key().as_ref()],
            bump,
        )]
        pub tier: Account<'info, Tier>,
        #[account(init, 
            payer = subscriber,
            space = 8 + 32 + 32 + 32 + 8 + 8 + 1,
            seeds = [b"subscription", app.key().as_ref(), tier.key().as_ref(), subscriber.key().as_ref()],
            bump,
        )]
        pub subscription: Account<'info, Subscription>, 
        #[account(mut,
            constraint = owner.owner == app.owner.key() && owner.mint == tier.mint 
        )]
        pub owner: Account<'info, TokenAccount>,
        #[account(mut)]
        pub subscriber: Signer<'info>,
        #[account(mut,
            constraint = subscriber_ata.mint == tier.mint && subscriber_ata.owner == subscriber.key() && subscriber_ata.amount >= tier.price,
        )]
        pub subscriber_ata: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
        pub system_program: Program<'info, System>,
    }

    pub fn subscribe(ctx: Context<Subscribe>, duration: u64) -> Result<()> {
        let app = &mut ctx.accounts.app;
        let tier = &mut ctx.accounts.tier; 
        let owner = ctx.accounts.owner.to_account_info();
        let subscriber = &mut ctx.accounts.subscriber.to_account_info();
        let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
        // if duration greater than 12 months set to 12 months
        let duration = if duration > 12 { 12 } else { duration };
        let token_program = ctx.accounts.token_program.to_account_info();
        
        // initiate subscription pda
        let subscription = &mut ctx.accounts.subscription;
        subscription.app = app.clone().key();
        subscription.tier = tier.clone().key();
        subscription.subscriber = subscriber.clone().key();
        subscription.expires = Clock::get().unwrap().unix_timestamp + (tier.interval as i64);

        // approve 
        let approve_amount = tier.price * duration;
        let approve_accounts = Approve {
            to: subscriber_ata.clone(),
            delegate: tier.to_account_info().clone(),
            authority: subscriber.clone(),
        };
        let approve_ctx = CpiContext::new(token_program.clone(), approve_accounts);
        approve(approve_ctx,  approve_amount)?;

        let transfer_accounts = Transfer {
            from: subscriber_ata.clone(),
            to: owner,
            authority: tier.to_account_info().clone(),
        };

        let app_key = app.key();
        let tier_bump = *ctx.bumps.get("tier").unwrap();
        let seeds = &[b"tier".as_ref(), app_key.as_ref(), &[tier_bump]];
        let signers = [&seeds[..]];

        let transfer_ctx =
            CpiContext::new_with_signer(token_program.clone(), transfer_accounts, &signers);

        transfer(transfer_ctx, tier.price)?;

        Ok(())
    }
