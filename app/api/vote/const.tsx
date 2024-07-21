import {PublicKey, clusterApiUrl} from '@solana/web3.js';
import dotenv from "dotenv";
dotenv.config();

export const DEFAULT_SOL_ADDRESS : PublicKey = new PublicKey(
    process.env.RECIPIENT ?? "H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw"
);

export const PROGRAM_ID : PublicKey = new PublicKey("2V4JsTjDnhzYtkSTL1RTqSreRMH5KErwGR6CcC6Ugh9s");

export const DEFAULT_SOL_AMOUNT : number = process.env.DEFAULT_AMOUNT ? parseFloat(process.env.DEFAULT_AMOUNT) : 1;

export const DEFAULT_RPC = process.env.RPC_URL ?? clusterApiUrl("devnet");

export const DEFAULT_TITLE = process.env.TITLE ?? "Quadratic Funding with BLINKS";

export const DEFAULT_AVATAR = process.env.AVATAR ?? "https://github.com/Noobmaster169/solana-blink/blob/main/public/solana_devs.jpg?raw=true";

export const DEFAULT_DESCRIPTION = process.env.DESCRIPTION ?? "This Funding Account is funded with donations to two different communities. Try this BLINKS to see how to participate in a Quadratic Funding using BLINKS";

