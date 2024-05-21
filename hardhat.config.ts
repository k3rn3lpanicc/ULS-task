import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { configDotenv } from "dotenv";

configDotenv();

const config: HardhatUserConfig = {
    networks: {
        sepolia: {
            url: 'https://sepolia.infura.io/v3/' + (process.env.PID as string),
            chainId: 11155111,
            accounts: [process.env.PRIVATE_KEY as string],
        },
    },
    solidity: '0.8.24',
    etherscan: {
        apiKey: {
            sepolia: process.env.SCANAPI as string,
        },
    },
};

export default config;
