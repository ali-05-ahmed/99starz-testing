import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { Address } from "cluster";
import { ERC2099starz, ERC2099starz__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";





describe("ERC2099starz", function () {
    it("Should return the total coins = owners coins", async function () {

        const [owner, addr1]: SignerWithAddress[] = await ethers.getSigners();
        const addresses: string[] = [owner.toString(), addr1.toString()]



        const ERC2099starz: ERC2099starz__factory = await ethers.getContractFactory("ERC2099starz");
        const erc2099starz: ERC2099starz = await ERC2099starz.deploy("99starz", "stz", 1000, owner.address);
        await erc2099starz.deployed();

        expect(await erc2099starz.totalSupply()).to.equal(1000);

        expect(await erc2099starz.balanceOf(await owner.getAddress())).to.equal(1000);


    });

    it("Should transfer coins correctly", async function () {
        const [owner, addr1] = await ethers.getSigners();


        const ERC2099starz = await ethers.getContractFactory("ERC2099starz");
        const erc2099starz = await ERC2099starz.deploy("99starz", "stz", 1000, owner.address);
        await erc2099starz.deployed();

        await erc2099starz.transfer(await addr1.getAddress(), 10);

        expect(await erc2099starz.balanceOf(await owner.getAddress())).to.equal(990);

        expect(await erc2099starz.balanceOf(await addr1.getAddress())).to.equal(10);

    });
});



// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Token contract", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    let Token: ERC2099starz__factory;
    let hardhatToken: ERC2099starz;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addrs: SignerWithAddress[];

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("ERC2099starz");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens once its transaction has been
        // mined.
        hardhatToken = await Token.deploy("99starz", "stz", 10000000, owner.address);
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        // If the callback function is async, Mocha will `await` it.
        it("Should set the right owner", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await hardhatToken.owner()).to.equal(owner.address);
        });

        // it("Should assign the total supply of tokens to the owner", async function () {
        //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
        //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
        // });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            // Transfer 50 tokens from owner to addr1
            await hardhatToken.transfer(addr1.address, 50);
            const addr1Balance = await hardhatToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await hardhatToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await hardhatToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

            // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
            // `require` will evaluate false and revert the transaction.
            await expect(
                hardhatToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("Not enough tokens");

            // Owner balance shouldn't have changed.
            expect(await hardhatToken.balanceOf(owner.address)).to.equal(
                initialOwnerBalance
            );
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance: BigNumber = await hardhatToken.balanceOf(owner.address);

            // Transfer 100 tokens from owner to addr1.
            await hardhatToken.transfer(addr1.address, 100);

            // Transfer another 50 tokens from owner to addr2.
            await hardhatToken.transfer(addr2.address, 50);

            // Check balances.
            const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance.toNumber() - 150);

            const addr1Balance = await hardhatToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await hardhatToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should update Allowance of address 2", async function () {
            const initialOwnerBalance: BigNumber = await hardhatToken.balanceOf(owner.address);

            // Approve 50 tokens from owner to addr2.
            await hardhatToken.approve(addr2.address, 50);

            // Check balances.
            const addr2Allowance = await hardhatToken.allowance(owner.address, addr2.address);
            expect(addr2Allowance).to.equal(50);
        });
        it("Should increase Allowance of address 2", async function () {
            const initialOwnerBalance: BigNumber = await hardhatToken.balanceOf(owner.address);

            // Approve 50 tokens from owner to addr2.
            await hardhatToken.approve(addr2.address, 60);

            // Check balances.
            const addr2Allowance = await hardhatToken.allowance(owner.address, addr2.address);
            expect(addr2Allowance).to.equal(60);
        });
        it("Should decrease Allowance of address 2", async function () {
            const initialOwnerBalance: BigNumber = await hardhatToken.balanceOf(owner.address);

            // Approve 50 tokens from owner to addr2.
            await hardhatToken.approve(addr2.address, 40);

            // Check balances.
            const addr2Allowance = await hardhatToken.allowance(owner.address, addr2.address);
            expect(addr2Allowance).to.equal(40);
        });
        it("Allowance Should remain same of address 2", async function () {
            const initialOwnerBalance: BigNumber = await hardhatToken.balanceOf(owner.address);

            // Approve 50 tokens from owner to addr2.
            await hardhatToken.approve(addr2.address, 40);

            // Check balances.
            const addr2Allowance = await hardhatToken.allowance(owner.address, addr2.address);
            expect(addr2Allowance).to.equal(40);
        });
    });
});



