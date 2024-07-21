import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuadraticFund } from "../target/types/quadratic_fund";
import { PublicKey } from "@solana/web3.js";

describe("quadratic-fund", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.QuadraticFund as Program<QuadraticFund>;

  const airdrop = async (publicKey : PublicKey, amount : number) =>{
    let airdropTx = await anchor.getProvider().connection.requestAirdrop(publicKey, amount);
    await confirmTransaction(airdropTx);
  }

  const confirmTransaction = async (tx : any) =>{
    const latestBlockHash = await anchor.getProvider().connection.getLatestBlockhash();
    await anchor.getProvider().connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx
    });
  }

  it("Is initialized!", async () => {
    const owner = anchor.web3.Keypair.generate();
    const funder = anchor.web3.Keypair.generate();
    const receiver = anchor.web3.Keypair.generate();
    const receiver2 = anchor.web3.Keypair.generate();
    await airdrop(owner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await airdrop(funder.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    console.log("Owner is:", owner.publicKey.toString());
    console.log("Receiver is:", receiver.publicKey.toString());
    console.log("Receiver2 is:", receiver2.publicKey.toString());

    //Creat the Funding Account PDA
    const [fundingAccount, _bump] = anchor.web3.PublicKey.findProgramAddressSync([], program.programId);
    console.log("Funding Account:", fundingAccount.toString());

    //Initialize Funding Account
    const tx = await program.methods
      .initialize(owner.publicKey, [receiver.publicKey, receiver2.publicKey])
      .accounts({
        fundingAccount: fundingAccount,
        authority : owner.publicKey
      })
      .signers([owner]).rpc();
    console.log("Initialize signature:", tx);
    
    //Deposit Funding to the Account
    const tx2 = await program.methods
      .deposit(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        fundingAccount: fundingAccount,
        authority: owner.publicKey
      })
      .signers([owner]).rpc();
    console.log("Deposit signature:", tx2);
    const fundingBalance = await anchor.getProvider().connection.getBalance(fundingAccount);
    console.log("Funding Account Balance After Deposit:", fundingBalance);
    
    //Participate in the Quadratic Funding Voting
    const tx3 = await program.methods
      .fund(new anchor.BN(0.05 * anchor.web3.LAMPORTS_PER_SOL), 0)
      .accounts({
        fundingAccount: fundingAccount,
        authority: owner.publicKey
      })
      .signers([owner]).rpc();
    console.log("QF Voting Signature:", tx3);
    const afterFunded = await anchor.getProvider().connection.getBalance(fundingAccount);
    console.log("Funding Account Balance After Voting:", afterFunded);

    //End the Quadratic Funding & Send the Balance to the Receivers
    const meta1 = {pubkey: receiver.publicKey, isWritable: true, isSigner: false}
    const meta2 = {pubkey: receiver2.publicKey, isWritable: true, isSigner: false}
    const tx5 = await program.methods
      .transfer()
      .accounts({
        fundingAccount: fundingAccount,
        recipient: receiver.publicKey,
        authority: owner.publicKey
      })
      .remainingAccounts([meta1, meta2])
      .signers([owner]).rpc();
    console.log("Transder Signature:", tx5);
    
    //Final Checks:
    const emptiedBalance = await anchor.getProvider().connection.getBalance(fundingAccount);
    console.log("Balance of the Funding Account:", emptiedBalance);
    const receiverBalance = await anchor.getProvider().connection.getBalance(receiver.publicKey);
    console.log("Receiver balance is now:", receiverBalance)
    const receiver2Balance = await anchor.getProvider().connection.getBalance(receiver2.publicKey);
    console.log("Receiver2 balance is now:", receiver2Balance)
  });
});
