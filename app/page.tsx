"use client";

import dynamic from 'next/dynamic'; 
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import React, { useState, useRef, use, useEffect, useMemo, JSXElementConstructor} from 'react';
import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';

//import { IDL, QuadraticFund } from "../anchor/quadratic-fund/target/types/quadratic_fund";
import IDL from "../anchor/idl.json";
import { BorshCoder } from '@project-serum/anchor';


const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
 
export default function Home() {
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey("2V4JsTjDnhzYtkSTL1RTqSreRMH5KErwGR6CcC6Ugh9s");

  const [apiResponse, setApiResponse] = useState<any>({});
  const [apiOptions, setApiOptions] = useState<any>([]);

  useEffect(() => {
    //Get the Blinks Data From The API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vote');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setApiResponse(data);    
        let apiOptions:any = []
        data.links.actions.map((item:any, key:any)=>{
          apiOptions.push(<div onClick={() =>{initateTx(item.href)}} className="boxButton" key={key}>{item.label}</div>);
        });
        setApiOptions(apiOptions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);
  
  const apicall = async () =>{
    if(wallet){
    //https://solana-action-mu.vercel.app/api/actions/donate?to=7J2qom6uYS1sExNZmxVyUbgjG7WQ4KuLe1T3NMDfHbfh&amount=10
    fetch(`https://solana-action-mu.vercel.app/api/actions/donate?to=7J2qom6uYS1sExNZmxVyUbgjG7WQ4KuLe1T3NMDfHbfh&amount=10`, {
      method: 'POST',
      body: JSON.stringify({ account: wallet.publicKey.toString(), })
    })
      .then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error('Failed to post data:', error));
   }
  }

  const initateTx = (href:any) =>{
    console.log(href);
  }

  // const serialized = async() =>{
  //   if(wallet){
  //     const tx = await connection.getTransaction();
  //     const coder = new BorshCoder(IDL);

  //     const ix = coder.instruction.decode();
  //     // const tx = await conn.getTransaction(sig);
  //     // const coder = new BorshCoder(IDL);
  //     // const ix = coder.instruction.decode(
  //     //   tx.transaction.message.instructions[0].data,
  //     //   'base58',
  //     // );
  //     // if(!ix) throw new Error("could not parse data");
  //     // const accountMetas = tx.transaction.message.instructions[0].map(
  //     //   (idx) => ({
  //     //     pubkey: tx.transaction.message.accountKeys[idx],
  //     //     isSigner: tx.transaction.message.isAccountSigner(idx),
  //     //     isWritable: tx.transaction.message.isAccountWritable(idx),
  //     //   }),
  //     // );
  //     // const formatted = coder.instruction.format(ix, accountMetas);
  //     // console.log(ix, formatted);
  //   }
  // };
  
  
  
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
    <div className="navbar flex justify-between">
      <div className="headerContainer">
        <h1 className="header">My Blink DApp</h1>
      </div>
      <div className="headerContainer walletButton">
        <WalletMultiButtonDynamic style={{background:"#222222"}} />
      </div>
    </div>
    <main className="flex flex-col items-center justify-start min-h-screen">
      <div className="flex flex-col box items-center shadow-xl p6">
        <div className="black-image">
          {apiResponse.icon ? <img src={apiResponse.icon}/> : ""}
        </div>
        <div className="boxContainer">
          <h1 className="boxTitle">{apiResponse.title ? apiResponse.title : ""}</h1>
        </div>
        <div className="boxContainer">
          <p>
            {apiResponse.description ? apiResponse.description : ""}
          </p>
        </div>
        <div className="boxContainer flex justify-between">
            {apiOptions}
        </div>
      </div>
      <div>  
        <button onClick={fund}>Click To Call Function</button>
      </div>
    </main>
    </>
  );
}