const { deploy, getDeployedContract } = require('rocketh-ethers')(require('rocketh'), require('ethers'));
const probabilityTable = require('../../web-app/src/math/mortalityProbabilities');

module.exports = async ({ chainId, accounts, initialRun, namedAccounts, registerDeployment }) => {
    const deployer = accounts[0];
    const gas = 3000000;
    const contractName = 'Ankou';

    const deployResult = await deploy(
        contractName,
        { from: deployer, gas },
        contractName,
        probabilityTable.map(v => Math.floor(v * 1000000)), Math.floor((30 * 24 * 60 * 60) / 15) //TODO time instead of blocks
    );

    if (initialRun) {
        console.log(contractName + ' deployed used  ' + deployResult.receipt.gasUsed.toString(10) + ' gas');
    }
};
