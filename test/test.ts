import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import dotenv from 'dotenv';
import { PaymentToken, ULSOperator, ULSToken } from '../typechain-types';
dotenv.config();

describe('ULS', function () {
    let owner: HardhatEthersSigner;
    let firstUser: HardhatEthersSigner;
    let secondUser: HardhatEthersSigner;
    let thirdUser: HardhatEthersSigner;
    let fourthUser: HardhatEthersSigner;
    let ulsPaymentToken: PaymentToken;
    let ulsOperator: ULSOperator;
    let ulsToken: ULSToken;
    beforeEach(async function () {
        [owner, firstUser, secondUser, thirdUser, fourthUser] =
            await ethers.getSigners();
        const ULSPaymentToken = await ethers.getContractFactory('PaymentToken');
        ulsPaymentToken = await ULSPaymentToken.deploy();
        const ULSOperator = await ethers.getContractFactory('ULSOperator');
        ulsOperator = await ULSOperator.deploy(
            await ulsPaymentToken.getAddress(),
            owner.address,
            fourthUser.address
        );
        const ULSToken = await ethers.getContractFactory('ULSToken');
        ulsToken = await ULSToken.deploy(
            'http://127.0.0.1:3000',
            'ULS Collection',
            'ULS',
            await ulsOperator.getAddress()
        );

        await ulsOperator.setULSToken(await ulsToken.getAddress());
    });

    describe('deployment', function () {
        it('should deploy the contracts', async function () {
            expect(ulsPaymentToken).to.not.be.undefined;
            expect(ulsOperator).to.not.be.undefined;
            expect(ulsToken).to.not.be.undefined;
        });
    });

    describe('transfer payment token', function () {
        it('should transfer payment token', async function () {
            await ulsPaymentToken
                .connect(owner)
                .transfer(firstUser.address, BigInt(1000) * BigInt(10 ** 18));
            expect(await ulsPaymentToken.balanceOf(firstUser.address)).to.equal(
                BigInt(1000) * BigInt(10 ** 18)
            );
        });
    });

    describe('Purchase and become a child', function () {
        it('should purchase and become a child', async function () {
            await ulsPaymentToken
                .connect(owner)
                .transfer(firstUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(firstUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );
            await ulsOperator
                .connect(firstUser)
                .purchase(owner.address, BigInt(100) * BigInt(10 ** 18));
            expect(await ulsToken.balanceOf(firstUser.address)).to.equal(1);
            expect(await ulsOperator.balances(owner)).to.equal(
                BigInt(1) * BigInt(10 ** 18)
            );
            expect(await ulsOperator.balances(fourthUser)).to.equal(
                BigInt(99) * BigInt(10 ** 18)
            );
        });
        it('should purchase and become a child: multiple users 1 level', async function () {
            await ulsPaymentToken
                .connect(owner)
                .transfer(firstUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(owner)
                .transfer(secondUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(owner)
                .transfer(thirdUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(firstUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(secondUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(thirdUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(firstUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsOperator
                .connect(firstUser)
                .purchase(owner.address, BigInt(100) * BigInt(10 ** 18));

            await ulsOperator
                .connect(secondUser)
                .purchase(owner.address, BigInt(100) * BigInt(10 ** 18));
            await ulsOperator
                .connect(thirdUser)
                .purchase(owner.address, BigInt(100) * BigInt(10 ** 18));

            expect(await ulsToken.balanceOf(firstUser.address)).to.equal(1);
            expect(await ulsToken.balanceOf(secondUser.address)).to.equal(1);
            expect(await ulsToken.balanceOf(thirdUser.address)).to.equal(1);

            expect(await ulsOperator.balances(owner)).to.equal(
                BigInt(3) * BigInt(10 ** 18)
            );
            expect(await ulsOperator.balances(fourthUser)).to.equal(
                BigInt(99*3) * BigInt(10 ** 18)
            );
        });
        it('should purchase and become a child: one user multilevel', async function () {
            await ulsPaymentToken
                .connect(owner)
                .transfer(firstUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(owner)
                .transfer(secondUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(owner)
                .transfer(thirdUser.address, BigInt(1000) * BigInt(10 ** 18));
            await ulsPaymentToken
                .connect(firstUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(secondUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(thirdUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsPaymentToken
                .connect(firstUser)
                .approve(
                    await ulsOperator.getAddress(),
                    BigInt(100) * BigInt(10 ** 18)
                );

            await ulsOperator
                .connect(firstUser)
                .purchase(owner.address, BigInt(100) * BigInt(10 ** 18));

            await ulsOperator
                .connect(secondUser)
                .purchase(firstUser.address, BigInt(100) * BigInt(10 ** 18));
            await ulsOperator
                .connect(thirdUser)
                .purchase(secondUser.address, BigInt(100) * BigInt(10 ** 18));

            expect(await ulsToken.balanceOf(firstUser.address)).to.equal(1);
            expect(await ulsToken.balanceOf(secondUser.address)).to.equal(1);
            expect(await ulsToken.balanceOf(thirdUser.address)).to.equal(1);

            expect(await ulsOperator.balances(owner)).to.equal(
                BigInt(10101) * BigInt(10 ** (18-4)) // these 1s correspond to 3 different purchases
            );
            expect(await ulsOperator.balances(firstUser)).to.equal(
                BigInt(9999) * BigInt(10 ** (18 - 4))
            );
            expect(await ulsOperator.balances(secondUser)).to.equal(
                BigInt(99) * BigInt(10 ** (18 - 2))
            );
            expect(await ulsOperator.balances(fourthUser)).to.equal(
                BigInt(99 * 3) * BigInt(10 ** 18)
            );
        });
    });
});
