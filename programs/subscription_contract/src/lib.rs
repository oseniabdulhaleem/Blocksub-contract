use anchor_lang::prelude::*;

declare_id!("BvuGGNocQNB8ybd6mYjy9HScPc3hf2bUWnQjVzbmDRCF");

#[program]
pub mod subscription_contract {
    use super::*;

    // Subscribe or extend a user's subscription
    pub fn subscribe(ctx: Context<Subscribe>, plan: String, payment_amount: u64, duration_in_days: u64) -> Result<()> {
        let subscription_account = &mut ctx.accounts.subscription_account;

        // Get the current time
        let current_timestamp = Clock::get()?.unix_timestamp as u64;

        // Check if the subscription is still active
        if current_timestamp < subscription_account.expiry_date {
            // If the subscription is still active, extend the expiry date
            subscription_account.expiry_date += duration_in_days * 24 * 60 * 60;
            subscription_account.payment_amount += payment_amount; // Add the new payment amount
        } else {
            // If the subscription has expired, start a new subscription
            let expiry_date = current_timestamp + duration_in_days * 24 * 60 * 60;
            subscription_account.plan = plan;
            subscription_account.user = *ctx.accounts.user.key;
            subscription_account.payment_amount = payment_amount;
            subscription_account.start_date = current_timestamp;
            subscription_account.expiry_date = expiry_date;
        }

        Ok(())
    }

    // Check the subscription status (whether the subscription has expired or not)
    pub fn check_subscription_status(ctx: Context<CheckStatus>) -> Result<bool> {
        let subscription_account = &ctx.accounts.subscription_account;
        let current_timestamp = Clock::get()?.unix_timestamp as u64;

        // Check if the current timestamp is before the expiry date
        if current_timestamp < subscription_account.expiry_date {
            return Ok(true);  // Subscription is active
        } else {
            return Ok(false);  // Subscription has expired
        }
    }
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(init, payer = user, space = 8 + 32 + 40 + 8 + 8 + 8)]
    pub subscription_account: Account<'info, SubscriptionAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckStatus<'info> {
    #[account(mut)]
    pub subscription_account: Account<'info, SubscriptionAccount>,
}

#[account]
pub struct SubscriptionAccount {
    pub user: Pubkey,           // User's public key (wallet address)
    pub plan: String,           // Subscription plan (e.g., "basic", "premium")
    pub payment_amount: u64,    // Amount paid for the subscription
    pub start_date: u64,        // Timestamp when the subscription started
    pub expiry_date: u64,       // Timestamp when the subscription expires
}


// use anchor_lang::prelude::*;

// declare_id!("BvuGGNocQNB8ybd6mYjy9HScPc3hf2bUWnQjVzbmDRCF");

// #[program]
// pub mod subscription_contract {
//     use super::*;

//     // Subscribe a user with a plan and duration
//     pub fn subscribe(ctx: Context<Subscribe>, plan: String, payment_amount: u64, duration_in_days: u64) -> Result<()> {
//         let subscription_account = &mut ctx.accounts.subscription_account;

//         // Calculate expiry date based on the current timestamp
//         let current_timestamp = Clock::get()?.unix_timestamp as u64;
//         let expiry_date = current_timestamp + duration_in_days * 24 * 60 * 60;

//         // Store the subscription details in the account
//         subscription_account.plan = plan;
//         subscription_account.user = *ctx.accounts.user.key;
//         subscription_account.payment_amount = payment_amount;
//         subscription_account.start_date = current_timestamp;
//         subscription_account.expiry_date = expiry_date;

//         Ok(())
//     }

//     // Check the subscription status (whether the subscription has expired or not)
//     pub fn check_subscription_status(ctx: Context<CheckStatus>) -> Result<bool> {
//         let subscription_account = &ctx.accounts.subscription_account;
//         let current_timestamp = Clock::get()?.unix_timestamp as u64;

//         // Check if the current timestamp is before the expiry date
//         if current_timestamp < subscription_account.expiry_date {
//             return Ok(true);  // Subscription is active
//         } else {
//             return Ok(false);  // Subscription has expired
//         }
//     }
// }


// #[derive(Accounts)]
// pub struct Subscribe<'info> {
//     #[account(init, payer = user, space = 8 + 32 + 40 + 8 + 8 + 8)]
//     pub subscription_account: Account<'info, SubscriptionAccount>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct CheckStatus<'info> {
//     #[account(mut)]
//     pub subscription_account: Account<'info, SubscriptionAccount>,
// }

// #[account]
// pub struct SubscriptionAccount {
//     pub user: Pubkey,           // User's public key (wallet address)
//     pub plan: String,           // Subscription plan (e.g., "basic", "premium")
//     pub payment_amount: u64,    // Amount paid for the subscription
//     pub start_date: u64,        // Timestamp when the subscription started
//     pub expiry_date: u64,       // Timestamp when the subscription expires
// }