const tap = require('tap')
const rocketh = require('rocketh');
const rockethUtil = require('rocketh-ethers')(rocketh, require('ethers'));
const assert = require('assert');
const annuity = require('../../web-app/src/math/annuity').default;
const BN = require('bn.js');

const accounts = rocketh.accounts;
const deployer = accounts[0];
const user1 = deployer; // TODO fix rocketh-ethers to support multiple account accounts[1];
// const user2 = accounts[2];
const gas = 3000000;

const {
    getBalance,
    getDeployedContract,
    deploy,
    fetchReceipt,
    tx,
    call,
    expectThrow,
} = rockethUtil;

tap.test('Pension', async (t) => {
    let contract;
    t.beforeEach(async () => {
        await rocketh.runStages();
        contract = getDeployedContract('Pension');
    });

    t.test('can join', async (t) => {
        await tx({ from: user1, gas }, contract, 'join', 18, 60, "1000000");
        const { joiningAge } = await call(contract, 'getPersonData', user1);
        assert.equal(joiningAge, 18);
    })

    t.test('can pay in', async (t) => {
        await tx({ from: user1, gas }, contract, 'join', 18, 60, "1000000");
        await tx({ from: user1, gas, value: 1000 }, contract, 'payIn');
        const { contribution } = await call(contract, 'getPersonData', user1);
        assert.equal(contribution, 1000);
    })

    t.test('payout is calculated correctly', async (t) => {
        await tx({ from: user1, gas }, contract, 'join', 18, 60, "10");
        const { payOutPerMonth } = await call(contract, 'getPersonData', user1);
        assert.equal(payOutPerMonth.toNumber(), annuity.payOutPerMonth(60, 18, 10));
    })

    t.test('can claim payOut after paying in all and after retirement time', async (t) => {
        await tx({ from: user1, gas }, contract, 'join', 18, 60, "10");
        
        const numMonths = (60 - 18) * 12;
        const numSeconds = numMonths * 2629746;
        const payIn = 10 * numMonths * 2;
        const payInBN = new BN(payIn);        
        await tx({ from: user1, gas, value: '0x' + payInBN.toString(16) }, contract, 'payIn');
        
        await tx({ from: deployer, gas }, contract, 'debug_addTimeDelta', numSeconds);

        const balanceBefore = await getBalance(user1);
        await tx({ from: user1, gas }, contract, 'claimPayOut');
        const balanceAfter = await getBalance(user1);
        // assert.equal(balanceAfter, balanceBefore + x); // TODO
    })

    t.test('cannot claim payOut before retirement', async (t) => {
        await tx({ from: user1, gas }, contract, 'join', 18, 60, "10");

        const numMonths = (60 - 18) * 12;
        const numSeconds = numMonths * 2629746;
        const payIn = 10 * numMonths * 2;
        const payInBN = new BN(payIn);
        
        await tx({ from: user1, gas, value: '0x' + payInBN.toString(16) }, contract, 'payIn');
        
        await expectThrow(tx({ from: user1, gas }, contract, 'claimPayOut'));
    })

})