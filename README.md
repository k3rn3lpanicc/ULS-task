# ULS Task

This repository contains the contracts & backend part of the multilevel interest propagation.

## Contracts part

### How to compile the contracts

To compile the contracts simply run `npx hardhat compile`. It is assumed that you already have run the `npm install` command.

### How to deploy the contracts?

To deploy the contracts, you need to create a `.env` file in the root directory of the project and fill these fields:

```
PRIVATE_KEY=<your private key here>
PID=<your project id of infura here>
SCANAPI=<you ethers.scan apikey here>
```

Then you can simply deploy to sepolia by running `npm run deploy`, the result should look like this:

```bash
> npx hardhat run deploy/deploy.ts --network sepolia

[ 👾 ] Initializing...
[ 👾 ] Deploying to chain: sepolia
[ 👾 ] PaymentToken Deployed to: 0xB09aa453453E3B34606B5Bf3AFc49ed1823A13d6
[ 👾 ] ULSOperator Deployed to: 0xdDa0039BC2806dc5C8415C2c638C73Edf2A492aa
[ 👾 ] ULSToken Deployed to: 0x4319Da6D5641f93c607e6f903cD00cB55773E1bC

```

Where you can see the deployed contract addresses. Payment token contract is for purchases and ULSOperator is the one we work with and ULSToken is the one which manages the nfts.

## Backend part

### How to run the backend part?

First, cd into the backend folder, run the `npm install` command, and then you can simply run `npm run start` command to start the backend of this project.

You should see `app started...` on your terminal.

The backend consists of 2 parts: event listener and metadata writer. The event listener part listens for events in the blockchain whenever a client purchases and becomes children of a referer. It catches the data from blockchain and interacts with the second part which is responsible for writing new metadatas into the disk and serve them to users as token uris. Also the backend has a buffer of changes which will process it every 30 seconds.
