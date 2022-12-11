use {
    crate::state::*,
    anchor_lang::prelude::*,
    anchor_lang::solana_program::instruction::Instruction,
    anchor_spl::token::{approve, Approve, Token, TokenAccount},
    clockwork_sdk::thread_program::{
        self,
        accounts::{Thread, Trigger},
        ThreadProgram,
    },
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
    /// CHECK: checked via PDA derivation
    #[account(mut, address = Thread::pubkey(subscription.key(),"subscriber_thread".to_string()))]
    pub subscription_thread: UncheckedAccount<'info>,
    #[account(address = thread_program::ID)]
    pub thread_program: Program<'info, ThreadProgram>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
    let app = &mut ctx.accounts.app;
    let tier = &ctx.accounts.tier;
    let subscriber = &mut ctx.accounts.subscriber.to_account_info();
    let subscriber_ata = &mut ctx.accounts.subscriber_ata.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let thread_program = ctx.accounts.thread_program.to_account_info();
    let system_program = ctx.accounts.system_program.to_account_info();
    let subscription_thread = ctx.accounts.subscription_thread.to_account_info();

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

    let now_timestamp = Clock::get().unwrap().unix_timestamp;

    let complete_payment_ix = Instruction {
        program_id: crate::ID,
        accounts: vec![
            AccountMeta::new(subscription.key(), true),
            AccountMeta::new_readonly(app.key(), false),
            AccountMeta::new(tier.key(), false),
            AccountMeta::new(app.treasury, false),
            AccountMeta::new(subscriber_ata.key(), false),
            AccountMeta::new(subscription_thread.key(), true),
            AccountMeta::new_readonly(token_program.key(), false),
            AccountMeta::new_readonly(system_program.key(), false),
        ],
        data: clockwork_sdk::anchor_sighash("complete_payment").into(),
    };

    clockwork_sdk::thread_program::cpi::thread_create(
        CpiContext::new_with_signer(
            thread_program,
            clockwork_sdk::thread_program::cpi::accounts::ThreadCreate {
                authority: subscription.to_account_info(),
                payer: subscriber.to_account_info(),
                system_program: system_program.to_account_info(),
                thread: subscription_thread.to_account_info(),
            },
            &[&[
                "SUBSCRIPTION".as_bytes(),
                app.key().as_ref(),
                subscriber.key().as_ref(),
                &[subscription.bump],
            ]],
        ),
        "subscriber_thread".to_string(),
        complete_payment_ix.into(),
        Trigger::Cron {
            schedule: tier.interval.cron_schedule(now_timestamp).clone(),
            skippable: false,
        },
    )?;

    Ok(())
}
