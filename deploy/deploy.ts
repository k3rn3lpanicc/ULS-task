import { ethers } from 'hardhat';

async function main() {
    const remainingFundsWallet = "";
    const masterWallet = '0x2cBFC23A609a34AafB7DDA667dbA883f9f224571';
    console.log('[ 👾 ] Initializing...');
    console.log(
        `[ 👾 ] Deploying to chain: ${
            (await ethers.provider.getNetwork()).name
        }`
    );
    const ULSPaymentToken = await ethers.getContractFactory('PaymentToken');
    const paymentToken = await ULSPaymentToken.deploy();

    console.log(`[ 👾 ] PaymentToken Deployed to: ${await paymentToken.getAddress()}`);

    const ULSOperator = await ethers.getContractFactory('ULSOperator');
    const ulsOperator = await ULSOperator.deploy(await paymentToken.getAddress(), masterWallet, remainingFundsWallet);
    console.log(`[ 👾 ] ULSOperator Deployed to: ${await ulsOperator.getAddress()}`);

    const ULSToken = await ethers.getContractFactory('ULSToken');
    const ulsToken = await ULSToken.deploy("http://127.0.0.1:3000", "ULS Collection", "ULS", await ulsOperator.getAddress());
    console.log(`[ 👾 ] ULSToken Deployed to: ${await ulsToken.getAddress()}`);
}   

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
