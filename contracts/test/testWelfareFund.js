const tap = require('tap')
const rocketh = require('rocketh');
const rockethUtil = require('rocketh-ethers')(rocketh, require('ethers'));
const assert = require('assert');

const accounts = rocketh.accounts;

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

})