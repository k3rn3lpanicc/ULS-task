import { ethers } from 'hardhat';

async function main() {
    const remainingFundsWallet = '0xb528089b6Bd3E5E0565a013302715dc6Babc594a';
    const masterWallet = '0x2cBFC23A609a34AafB7DDA667dbA883f9f224571';
    console.log('[ 👾 ] Initializing...');
    console.log(
        `[ 👾 ] Deploying to chain: ${
            (await ethers.provider.getNetwork()).name
        }`
    );
    const ULSPaymentToken = await ethers.getContractFactory('PaymentToken');
    const paymentToken = await ULSPaymentToken.deploy();

    await paymentToken.transfer(
        '0x89281F2dA10fB35c1Cf90954E1B3036C3EB3cc78',
        BigInt(1000) * BigInt(10 ** 18)
    );

    await paymentToken.transfer(
        '0xb528089b6Bd3E5E0565a013302715dc6Babc594a',
        BigInt(1000) * BigInt(10 ** 18)
    );

    await paymentToken.transfer(
        '0x34659224CfcD5Ee3A763e06879F9Ab6179b92716',
        BigInt(1000) * BigInt(10 ** 18)
    );

    console.log(`[ 👾 ] PaymentToken Deployed to: ${await paymentToken.getAddress()}`);

    const ULSOperator = await ethers.getContractFactory('ULSOperator');
    const ulsOperator = await ULSOperator.deploy(await paymentToken.getAddress(), masterWallet, remainingFundsWallet);
    console.log(`[ 👾 ] ULSOperator Deployed to: ${await ulsOperator.getAddress()}`);

    const ULSToken = await ethers.getContractFactory('ULSToken');
    const ulsToken = await ULSToken.deploy("http://127.0.0.1:3000", "ULS Collection", "ULS", await ulsOperator.getAddress());
    console.log(`[ 👾 ] ULSToken Deployed to: ${await ulsToken.getAddress()}`);

    await ulsOperator.setULSToken(await ulsToken.getAddress());
    console.log(`Added uls token to operator`);
}   

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
