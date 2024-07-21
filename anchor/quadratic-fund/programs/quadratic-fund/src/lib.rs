use anchor_lang::prelude::*;
use anchor_lang::system_program;
use std::mem::size_of;

declare_id!("4dJUHV6StKArznZ7Dd8dTDv6jmquhMbZu6YYzYJZcWW3");

#[program]
pub mod quadratic_fund {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, owner: Pubkey, receivers: Vec<Pubkey>) -> Result<()> {
        let receiver_length  = receivers.len();
        require!(receiver_length < Funding::MAX_LEN, Errors::ExceedingLength);
        require!(receiver_length > 0 as usize, Errors::NoReceiver);

        ctx.accounts.funding_account.owner = owner;
        ctx.accounts.funding_account.length = receiver_length as u16;

        
        let old_addresses = ctx.accounts.funding_account.receivers;
        let mut addresses : Vec<Pubkey> = Vec::new();
        addresses.extend_from_slice(&receivers);
        for _ in receiver_length..Funding::MAX_LEN {
            msg!("Adding Empty Address to Unused Array Slot");
            addresses.push(Pubkey::default());
        };

        let addresses_array: [Pubkey; Funding::MAX_LEN] = match addresses.try_into() {
            Ok(old_addresses) =>{old_addresses},
            Err(e) => {
                msg!("Error: {:?}", e);
                return Err(Errors::InvalidArgument.into());
            }
        };
        ctx.accounts.funding_account.receivers = addresses_array;
        ctx.accounts.funding_account.voters = [0, 0, 0];
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount:u64) -> Result<()>{
        require!(ctx.accounts.funding_account.owner == ctx.accounts.authority.key(), Errors::OnlyOwner);

        let deposit_cpi = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer{
                from: ctx.accounts.authority.to_account_info().clone(),
                to: ctx.accounts.funding_account.to_account_info().clone(),
            },
        );
        system_program::transfer(deposit_cpi, amount)?;
        Ok(())
    }

    pub fn fund(ctx:Context<Fund>, amount: u64, option: u32) -> Result<()>{
        require!(amount > 0, Errors::ZeroFunding);
        require!(option < ctx.accounts.funding_account.length as u32, Errors::InvalidArgument);

        //Mapping Not Implemented Yet: Function blindly trust that participant hasn't participated in the funding
        let index = option as usize;
        ctx.accounts.funding_account.voters[index] += 1;

        //Transfer funded balance to the Funding Account
        let deposit_cpi = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer{
                from: ctx.accounts.authority.to_account_info().clone(),
                to: ctx.accounts.funding_account.to_account_info().clone(),
            },
        );
        system_program::transfer(deposit_cpi, amount)?;
        Ok(())
    }

    pub fn transfer(ctx:Context<Transfer>) -> Result<()>{
        msg!("Transfering Funds to all funding receivers");
        require!(ctx.accounts.funding_account.owner == ctx.accounts.authority.key(), Errors::OnlyOwner);
        require!(ctx.accounts.funding_account.length == ctx.remaining_accounts.len() as u16, Errors::InvalidArgument);

        //Check the Quadratic Fund result
        let receiver_length = ctx.accounts.funding_account.length;
        let voting_counts = ctx.accounts.funding_account.voters;
        let voting_total : u32 = voting_counts.iter().sum();
        require!(voting_total > 0, Errors::NoFundReceived);

        //Alllocate the sent amount
        let fund = ctx.accounts.funding_account.to_account_info().lamports();
        ctx.accounts.funding_account.sub_lamports(fund)?;
        msg!("Account Balance: {}", fund);
        
        //Transfer balance to each receiver
        let mut counter : u16 = 0;
        msg!("Passed Remaining Account: {:?}", ctx.remaining_accounts);
        for i in 0..receiver_length{
            let recipient = &ctx.remaining_accounts[i as usize];

            require!(recipient.to_account_info().key() == ctx.accounts.funding_account.receivers[counter as usize], Errors::WrongReceiverAccount);
            msg!("Public Key {:?}", recipient.to_account_info().key());
            // msg!("Expected Key {:?}", ctx.accounts.funding_account.receivers[counter as usize]);
            // msg!("Check: {}", recipient.to_account_info().key() == ctx.accounts.funding_account.receivers[counter as usize]);

            let receiver_vote = voting_counts[counter as usize];
            let received_funds = (fund / 2 / receiver_length as u64) + (fund / 2 * receiver_vote as u64/ voting_total as u64);
            msg!("Send Funds: {}", received_funds);

            recipient.to_account_info().add_lamports(received_funds)?;
            counter += 1;
        }
        Ok(())
    }

    pub fn test(ctx:Context<Test>) -> Result<()>{
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Test{}

#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(
        init, 
        payer = authority, 
        space = size_of::<Funding>() + 8,
        seeds = [],
        bump,
    )]
    pub funding_account : Account<'info, Funding>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program : Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info>{
    #[account(mut, seeds=[], bump)]
    pub funding_account: Account<'info, Funding>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program : Program<'info, System>,
}

#[derive(Accounts)]
pub struct Fund<'info>{
    #[account(mut, seeds=[], bump)]
    pub funding_account: Account<'info, Funding>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program : Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info>{
    #[account(mut, seeds=[], bump)]
    pub funding_account: Account<'info, Funding>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program : Program<'info, System>,
}

#[account]
pub struct Funding {
    owner: Pubkey,
    length: u16,
    receivers: [Pubkey; 3],
    voters: [u32; 3],
}

impl Funding{
    pub const MAX_LEN : usize = 3;
}

#[error_code]
pub enum Errors{
    #[msg("Actions only allowed for contract owner")]
    OnlyOwner,
    #[msg("Deposit can only happen once")]
    DoubleDeposit,
    #[msg("Invalid Recipient")]
    InvalidRecipient,
    #[msg("Maximum of 5 Receivers for the Funding")]
    ExceedingLength,
    #[msg("No Receiver added to the Funding")]
    NoReceiver,
    #[msg("Invalid Argument for the Function")]
    InvalidArgument,
    #[msg("Funded Account for participation must be greater than Zero")]
    ZeroFunding,
    #[msg("Funding hasn't had any participation")]
    NoFundReceived,
    #[msg("Passed account doesn't equal to the receiver's address")]
    WrongReceiverAccount,
}
