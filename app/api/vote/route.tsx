import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
  } from "@solana/actions";
  import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
  } from "@solana/web3.js";
  import {
    DEFAULT_SOL_ADDRESS,
    DEFAULT_SOL_AMOUNT,
    DEFAULT_RPC,
    DEFAULT_TITLE,
    DEFAULT_AVATAR,
    DEFAULT_DESCRIPTION,
    PROGRAM_ID,
  } from "./const";
  
  export const GET = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { option, programId } = validatedQueryParams(requestUrl);
  
      const amount = DEFAULT_SOL_AMOUNT;
      const baseHref = new URL(
        `/api/vote?to=${programId.toBase58()}`,
        requestUrl.origin
      ).toString();
  
      const payload: ActionGetResponse = {
        title: DEFAULT_TITLE,
        icon:
          DEFAULT_AVATAR ?? new URL("/solana_devs.jpg", requestUrl.origin).toString(),
        description: DEFAULT_DESCRIPTION,
        label: "Quadratic Funding with BLINKS", // this value will be ignored since `links.actions` exists
        links: {
          actions: [
            {
              label: `Send ${amount} SOL for First Option`, // button text
              href: `${baseHref}&option=0`,
            },
            {
              label: `Send ${amount} SOL for Second Option`, // button text
              href: `${baseHref}&option=1`,
            },
          ],
        },
      };
  
      return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
    } catch (err) {
      console.log(err);
      let message = "An unknown error occurred";
      if (typeof err == "string") message = err;
      return new Response(message, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  };
  
  // DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
  // THIS WILL ENSURE CORS WORKS FOR BLINKS
  export const OPTIONS = GET;
  
  export const POST = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { option, programId } = validatedQueryParams(requestUrl);
  
      const empty = option;
      const amount = DEFAULT_SOL_AMOUNT;
      const body: ActionPostRequest = await req.json();
  
      // validate the client provided input
      let account: PublicKey;
      try {
        account = new PublicKey(body.account);
      } catch (err) {
        return new Response('Invalid "account" provided', {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }
  
      //How to create the Anchor Wallet instance???
      const connection = new Connection(DEFAULT_RPC);
  
      // ensure the receiving account will be rent exempt
      const minimumBalance = await connection.getMinimumBalanceForRentExemption(
        0 // note: simple accounts that just store native SOL have `0` bytes of data
      );
      if (amount * LAMPORTS_PER_SOL < minimumBalance) {
        throw `account may not be rent exempt: ${programId.toBase58()}`;
      }
  
      const transaction = new Transaction();
      transaction.feePayer = account;
  
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: account,
          toPubkey: programId,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
  
      // set the end user as the fee payer
      transaction.feePayer = account;
  
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
  
      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction,
          message: `Send ${amount} SOL to ${programId.toBase58()}`,
        },
        // note: no additional signers are needed
        // signers: [],
      });
  
      return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
    } catch (err) {
      console.log(err);
      let message = "An unknown error occurred";
      if (typeof err == "string") message = err;
      return new Response(message, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  };
  
  function validatedQueryParams(requestUrl: URL) {
    let programId: PublicKey = PROGRAM_ID;
    let option: number = 0;
  
    try {
      if (requestUrl.searchParams.get("to")) {
        programId = new PublicKey(requestUrl.searchParams.get("to")!);
      }
    } catch (err) {
      throw "Invalid input query parameter: to";
    }
  
    try {
      if (requestUrl.searchParams.get("option")) {
        option = parseInt(requestUrl.searchParams.get("option")!);
      }
  
      if (option <= 0) throw "Invalid Option";
    } catch (err) {
      throw "Invalid input query parameter: amount";
    }
  
    return {
      option,
      programId,
    };
  }