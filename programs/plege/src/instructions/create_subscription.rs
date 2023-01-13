use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_spl::token::{approve, Approve, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    pub app: Account<'info, App>,
    #[account(
        has_one = app,
        constraint = tier.active == true,
        constraint = tier.accepting_new_subs == true
    )]
    pub tier: Account<'info, Tier>,
    #[account(init,
        payer = subscriber,
        space = 8 + std::mem::size_of::<Subscription>(),
        seeds = ["SUBSCRIPTION".as_bytes(), app.key().as_ref(), subscriber.key().as_ref()],
        bump,
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        constraint = subscriber_ata.mint == app.mint && subscriber_ata.owner == subscriber.key() && subscriber_ata.amount >= tier.price,
    )]
    pub subscriber_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
    let app = &mut ctx.accounts.app;
    let tier = &ctx.accounts.tier;
    let subscriber = &mut ctx.accounts.subscriber.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    // initiate subscription pda
    let subscription = &mut ctx.accounts.subscription;
    subscription.app = app.clone().key();
    subscription.tier = tier.clone().key();
    subscription.subscriber = subscriber.clone().key();
    // subscription.expiration = Clock::get().unwrap().unix_timestamp + (tier.interval as i64);
    subscription.start = Clock::get().unwrap().unix_timestamp;
    subscription.pay_period_start = subscription.start;
    subscription.pay_period_expiration = subscription.start;
    subscription.last_payment_time = None;
    subscription.accept_new_payments = true;
    subscription.credits = 0;
    subscription.bump = *ctx.bumps.get("subscription").unwrap();

    // approve
    let approve_amount = tier.price * tier.interval.max_approval_len();
    let approve_accounts = Approve {
        to: subscriber_ata.clone(),
        delegate: subscription.to_account_info().clone(),
        authority: subscriber.clone(),
    };
    let approve_ctx = CpiContext::new(token_program.clone(), approve_accounts);
    approve(approve_ctx, approve_amount)?;

    Ok(())
}
