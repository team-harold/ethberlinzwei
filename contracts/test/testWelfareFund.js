const tap = require('tap')
const rocketh = require('rocketh');
const rockethUtil = require('rocketh-ethers')(rocketh, require('ethers'));
const assert = require('assert');

const accounts = rocketh.accounts;
const deployer = accounts[0];
const gas = 3000000;

const {
    getDeployedContract,
    deploy,
    fetchReceipt,
    tx,
} = rockethUtil;

tap.test('WelfareFund', async (t) => {
    let contract;
    t.beforeEach(async () => {
        await rocketh.runStages();
        contract = getDeployedContract('WelfareFund');
    });

    t.test('can join', async (t) => {
        const trx = await tx({ from: deployer, gas }, contract, 'join', 18, 60, "1000000");
        const receipt = await fetchReceipt(trx.hash)
        console.log(JSON.stringify(receipt, null, '  '));
    })

})