import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { Address } from "cluster";
import { PrivateVesting, PrivateVesting__factory, ERC2099starz, ERC2099starz__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";





describe("Vesting", function () {
    it("Should Deploy Vesting Contract", async function () {

        const [owner, addr1]: SignerWithAddress[] = await ethers.getSigners();
        const addresses: string[] = [owner.toString(), addr1.toString()]

        const ERC2099starz: ERC2099starz__factory = await ethers.getContractFactory("ERC2099starz");
        const erc2099starz: ERC2099starz = await ERC2099starz.deploy("99starz", "stz", 1000, owner.address);
        await erc2099starz.deployed();



        const PrivateVesting: PrivateVesting__factory = await ethers.getContractFactory("PrivateVesting");
        const privateVesting: PrivateVesting = await PrivateVesting.deploy(
            erc2099starz.address,
            15780000,
            1636641500,
            52600000,
            86400);
        await privateVesting.deployed();

    });

    describe("Vesting contract", function () {
        // Mocha has four functions that let you hook into the the test runner's
        // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

        // They're very useful to setup the environment for tests, and to clean it
        // up after they run.

        // A common pattern is to declare some variables, and assign them in the
        // `before` and `beforeEach` callbacks.

        let Token: ERC2099starz__factory;
        let hardhatToken: ERC2099starz;
        let Vesting: PrivateVesting__factory;
        let contract: PrivateVesting;
        let owner: SignerWithAddress;
        let addr1: SignerWithAddress;
        let addr2: SignerWithAddress;
        let addrs: SignerWithAddress[];

        // `beforeEach` will run before each test, re-deploying the contract every
        // time. It receives a callback, which can be async.
        beforeEach(async function () {
            // Get the ContractFactory and Signers here.
            Token = await ethers.getContractFactory("ERC2099starz");
            Vesting = await ethers.getContractFactory("PrivateVesting");
            [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
            const initialSupply = BigNumber.from("99000000000000000000000000");

            // To deploy our contract, we just have to call Token.deploy() and await
            // for it to be deployed(), which happens once its transaction has been
            // mined.
            hardhatToken = await Token.deploy("99starz", "stz", initialSupply, owner.address);
            contract = await Vesting.deploy(hardhatToken.address,
                15780000,
                1636641500,
                52600000,
                86400);
        });

        // You can nest describe calls to create subsections.
        describe("Deployment", function () {
            // `it` is another Mocha function. This is the one you use to define your
            // tests. It receives the test name, and a callback function.

            // If the callback function is async, Mocha will `await` it.
            it("Should transfer the token to the Vesting contract", async function () {
                await hardhatToken.transfer(contract.address, 100);
                const addr1Balance = await hardhatToken.balanceOf(contract.address);
                expect(addr1Balance).to.equal(100);
                await contract.addAddress(owner.address)
                let amount = await contract.getAmountWithdrawn()
                console.log(amount.toNumber())
                await contract.createVestingSchedule(owner.address, true, 1);
            });

            it("Should whitelist the owner address", async function () {
                await contract.addAddress(owner.address)
                const whitelisted = await contract.whitelisted(owner.address)
                expect(whitelisted).to.equal(true);
            });

            it("Should create vesting schedule", async function () {
                await hardhatToken.transfer(contract.address, 100);
                const addr1Balance = await hardhatToken.balanceOf(contract.address);
                expect(addr1Balance).to.equal(100);
                await contract.addAddress(owner.address)
                await contract.createVestingSchedule(owner.address, true, 1);
            });
            it("Should revoke vesting schedule", async function () {
                await hardhatToken.transfer(contract.address, 100);
                const addr1Balance = await hardhatToken.balanceOf(contract.address);
                expect(addr1Balance).to.equal(100);
                await contract.addAddress(owner.address)
                await contract.createVestingSchedule(owner.address, true, 1);
                let ID = await contract.computeByteIdForAddress(owner.address)
                await contract.revoke(ID)
                let revoked = await contract.checkRevoked(ID)
                expect(revoked).to.equal(true);
                await console.log("waited for 10 seconds")
            });
            it("Should release vested Token", async function () {
                await hardhatToken.transfer(contract.address, 1000);
                const addr1Balance = await hardhatToken.balanceOf(contract.address);
                expect(addr1Balance).to.equal(1000);
                await contract.addAddress(owner.address)
                await contract.createVestingSchedule(owner.address, true, 50);
                let ID = await contract.computeByteIdForAddress(owner.address)
                await new Promise(resolve => setTimeout(resolve, 10000)); // 3 sec
                await contract.release(ID, 1)
                let amount = await contract.getWithdrawableAmount();
                console.log(amount.toNumber())
            });

        });

    });
});

