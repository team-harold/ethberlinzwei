const tap = require('tap')
const rocketh = require('rocketh');
const rockethUtil = require('rocketh-ethers')(rocketh, require('ethers'));
const assert = require('assert');
const annuity = require('../../web-app/src/math/annuity');
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
} = rockethUtil;

tap.test('WelfareFund', async (t) => {
    let contract;
    t.beforeEach(async () => {
        await rocketh.runStages();
        contract = getDeployedContract('WelfareFund');
    });

    t.test('can join', async (t) => {
        const trx = await tx({ from: user1, gas }, contract, 'join', 18, 60, "1000000");
        await trx.wait();
        // const receipt = await fetchReceipt(trx.hash)
        // console.log(JSON.stringify(receipt, null, '  '));
    })

    t.test('can pay in', async (t) => {
        let trx;
        trx = await tx({ from: user1, gas }, contract, 'join', 18, 60, "1000000");
        // console.log(trx);
        await trx.wait();
        await tx({ from: user1, gas, value: 1000 }, contract, 'payIn');
    })

    function wait(t) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, t * 1000);
        })
    }

    t.test('can pay out', async (t) => {
        let trx;
        trx = await tx({ from: user1, gas }, contract, 'join', 18, 60, "10");
        await trx.wait();
        await wait(0.5);
        // const payIn = new BN(annuity.default.payInPerMonth(18, 60, 1000000));
        const numMonths = (60 - 18) * 12;
        const numSeconds = numMonths * 2629746;
        const payIn = 10 * numMonths * 2;
        const payInBN = new BN(payIn);
        console.log({ payIn, payInS: payInBN.toString('hex') });

        let cTime = await call(contract, 'getTime');
        let payOutPerMonth = await call(contract, 'getPayOutPerMonth', user1);
        let payInPerMonths = await call(contract, 'getPayInPerMonth', user1);
        console.log({ cTime, payOutPerMonth, payInPerMonths });

        let payInData;
        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        trx = await tx({ from: user1, gas, value: '0x' + payInBN.toString(16) }, contract, 'payIn');
        await trx.wait();
        await wait(0.5);

        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        trx = await tx({ from: deployer, gas }, contract, 'debug_addTimeDelta', numSeconds);
        await trx.wait();
        await wait(0.5);

        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        const balanceBefore = await getBalance(user1);

        trx = await tx({ from: user1, gas }, contract, 'claimPayOut');
        await trx.wait();


        const balanceAfter = await getBalance(user1);

        console.log({ balanceBefore, balanceAfter });
    })

    t.test('can pay out', async (t) => {
        let trx;
        trx = await tx({ from: user1, gas }, contract, 'join', 18, 60, "10");
        // const payIn = new BN(annuity.default.payInPerMonth(18, 60, 1000000));
        const numMonths = (60 - 18) * 12;
        const numSeconds = numMonths * 2629746;
        const payIn = 10 * numMonths * 2;
        const payInBN = new BN(payIn);
        console.log({ payIn, payInS: payInBN.toString('hex') });

        let cTime = await call(contract, 'getTime');
        let payOutPerMonth = await call(contract, 'getPayOutPerMonth', user1);
        let payInPerMonths = await call(contract, 'getPayInPerMonth', user1);
        console.log({ cTime, payOutPerMonth, payInPerMonths });

        let payInData;
        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        trx = await tx({ from: user1, gas, value: '0x' + payInBN.toString(16) }, contract, 'payIn');
        await trx.wait();
        await wait(0.5);

        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        // trx = await tx({ from: deployer, gas }, contract, 'debug_addTimeDelta', numSeconds);
        // await trx.wait();
        // await wait(0.5);

        payInData = await call(contract, 'getPayIn', user1);
        console.log({ payInData });

        const balanceBefore = await getBalance(user1);

        trx = await tx({ from: user1, gas }, contract, 'claimPayOut');
        await trx.wait();


        const balanceAfter = await getBalance(user1);

        console.log({ balanceBefore, balanceAfter });
    })

})