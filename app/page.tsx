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
  }, [wallet]);
  
  const apicall = async (href:any) =>{
    if(wallet){
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      await fetch(href, {
        method: 'POST',
        body: JSON.stringify({ account: wallet.publicKey.toString(), })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        console.log(data.message);
        console.log("Tansaction is:", data.transaction);
        
        //Process only allowed on solana action side
        //transaction -> base-64 decode then deserialize
        //feePayer not added
        //recentBlockHash not added
        //then sign the account
        //provider.sendAndConfirm(data.transaction);
      })
      .catch(error => console.error('Failed to post data:', error));
   }
  }

  const initateTx = async (href:any) =>{
    if(wallet){
      try{
        apicall(href);
        const queryParams = href.split('?')[1];
        const value = queryParams.split('=')[1]; 
        const option = value[value.length - 1];
        fund(parseInt(option));
      }catch(e){
        console.log(e);
      }
    }else{
      alert("Wallet Not Connected");
    }
  }  
  
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
      }catch(e){
        console.log(e)
      }
    }
  }

  const fund = async(option:number = 0) =>{
    if(wallet){
      try{
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);
      const [fundingPDA, _bump] = findProgramAddressSync([], programId);
      console.log("Funding Account is:", fundingPDA.toString());
      console.log("Program:", program);
      console.log(JSON.stringify(program));

      const tx = await program.methods
        .fund(new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL), option)
        .accounts({
          fundingAccount: fundingPDA,
          authority : wallet.publicKey
        }).rpc();
      console.log("Transaction:", tx)
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

  const initialize = async () =>{
    if(wallet){
      try{
      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program =  new anchor.Program<any>(IDL, programId, provider);

      const [pda, _bump] = findProgramAddressSync([], programId);
      console.log("PDA is:", pda.toString());
      const tx = await program.methods.initialize(wallet.publicKey, [wallet.publicKey, wallet.publicKey])
        .accounts({fundingAccount: pda, authority: wallet.publicKey}).rpc();
      console.log("Transaction:", tx)
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
    </main>
    </>
  );
}