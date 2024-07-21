"use client";

import dynamic from 'next/dynamic'; 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import React, { useState, useRef, use, useEffect, useMemo} from 'react';
import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';

//import { IDL, QuadraticFund } from "../anchor/quadratic-fund/target/types/quadratic_fund";
import IDL from "../anchor/idl.json";


const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
 
export default function Home() {
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey("2V4JsTjDnhzYtkSTL1RTqSreRMH5KErwGR6CcC6Ugh9s");

  const transfer = async() =>{
    if(wallet){
      try{
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);
      const [fundingPDA, _bump] = findProgramAddressSync([], programId);
      console.log("Funding Account is:", fundingPDA.toString());
      
      const meta1 = {pubkey: wallet.publicKey, isWritable: true, isSigner: false}
      const meta2 = {pubkey: wallet.publicKey, isWritable: true, isSigner: false}
      const tx = await program.methods
        .transfer()
        .accounts({
          fundingAccount: fundingPDA,
          authority : wallet.publicKey
        })
        .remainingAccounts([meta1, meta2]).rpc();
      console.log("Transaction:", tx)
      console.log("PDA is:", fundingPDA.toString());
      
      }catch(e){
        console.log(e)
      }
    }
  }

  const fund = async() =>{
    if(wallet){
      try{
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);
      const [fundingPDA, _bump] = findProgramAddressSync([], programId);
      console.log("Funding Account is:", fundingPDA.toString());
      
      const tx = await program.methods
        .fund(new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL), 0)
        .accounts({
          fundingAccount: fundingPDA,
          authority : wallet.publicKey
        }).rpc();
      console.log("Transaction:", tx)
      console.log("PDA is:", fundingPDA.toString());
      
      }catch(e){
        console.log(e)
      }
    }
  }


  const deposit = async() =>{
    if(wallet){
      try{
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);
      const [fundingPDA, _bump] = findProgramAddressSync([], programId);
      console.log("Funding Account is:", fundingPDA.toString());
      
      const tx = await program.methods
        .deposit(new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL))
        .accounts({
          fundingAccount: fundingPDA,
          authority : wallet.publicKey
        }).rpc();
      console.log("Transaction:", tx)
      console.log("PDA is:", fundingPDA.toString());
      
      }catch(e){
        console.log(e)
      }
    }
  }

  const execute = async () =>{
    if(wallet){
      try{
      console.log("IDL:", IDL);
      console.log("Wallet Detected:", wallet.publicKey.toString());

      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);

      const [pda, _bump] = findProgramAddressSync([], programId);
      console.log("PDA is:", pda.toString());
    
      console.log("Program Created")
      const tx = await program.methods.initialize(wallet.publicKey, [wallet.publicKey, wallet.publicKey])
        .accounts({fundingAccount: pda, authority: wallet.publicKey}).rpc();
      console.log("Transaction:", tx)
      console.log("PDA is:", pda.toString());
      
      }catch(e){
        console.log(e)
      }
    }
  }
  
  return (
    <>
    <main className="flex items-center justify-center min-h-screen">
      <WalletMultiButtonDynamic style={{}} />
      <button onClick={fund}>Click To Call Function</button>
    </main>
    </>
  );
}