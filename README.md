This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Quadratic Funding with Solana & BLINKS

I made a smart contract using anchor to implement a simple quadratic funding. Then I tried to make an API connection using Solana Blinks.

## Smart Contract

The project uses Anchor to build a simple Solana Smart contract with a similar to Quadratic Funding features.

The owner of the Quadratic Funding will initialize the funding account and deposit the funding balance to the communities/funding parties. Then, users will participate in the funding by voting their chosen options.

The fund will then be distributed to the receivers by considering the numbers of votes received during the funding processes.

## About BLINKS

[BLINKS](https://solana.com/docs/advanced/actions) is a new technology within Solana that allows transactions to be passed through API features, allowing a seamless experience for users while making a transaction.

This technology makes transactions on Solana sharable through a simple link that could be integrated on QR codes, button + widgets, or websites accross the internet.

BLINKS allows developers to integrate Solana ecosystem to many different environments, allowing users to perform blockchain transactions without having to navigate to different app / webpages.

## Usability

The smart contract allow users to initiate a quadratic funding session to distribute a certain ammount of balance to several receivers. The contract can then be used to start a funding activity.

The introduction of **BLINKS** in this applications take the proces one step further, allowing users to easily interact with the smart contract, ensuring that the funding activity could be easily shared & reached out to more participants & bigger communities.

BLINKS application might need additional technology integrations & improvements before successfully opening a new path for further innovations with DApps & Smart Contracts. However, it is undoubted that the technology has the capability to further improve interaction with blockchain applications and make the activity seamless.

## Getting Started

First, clone the repo:

```bash
git clone https://github.com/Noobmaster169/blink-funding-dapp
cd blink-funding-dapp
```

Then, install the packages:

```bash
npm install
# or
yarn install
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployed dApp

Check out this dApp to explore how to try the quadratic funding. Please note that this application is deployed on Devnet, not mainnet.

[https://funding-with-blink.vercel.app/](https://funding-with-blink.vercel.app/)

## API Call To Vote in the funding

[https://funding-with-blink.vercel.app/api/vote/](https://funding-with-blink.vercel.app/api/vote/)

