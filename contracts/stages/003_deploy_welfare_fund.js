const { deploy, getDeployedContract, tx } = require('rocketh-ethers')(require('rocketh'), require('ethers'));
const interestRate5PCnominators = require('../../web-app/src/math/interestRate5PCnominators');
const lifeTable = require('../../web-app/src/math/germanLifeTable1994');

module.exports = async ({ chainId, accounts, initialRun, namedAccounts, registerDeployment }) => {
    const deployer = accounts[0];
    const gas = 3000000;
    const contractName = 'WelfareFund';

    const eligibilityOracle = getDeployedContract('AlwaysEligibleUnlessDead');
    const deathOracle = getDeployedContract('Ankou');
    const deployResult = await deploy(
        contractName,
        { from: deployer, gas },
        contractName,
        lifeTable, interestRate5PCnominators, eligibilityOracle.address, deathOracle.address
    );

    if (initialRun) {
        console.log(contractName + ' deployed used  ' + deployResult.receipt.gasUsed.toString(10) + ' gas');
    }

    await tx({ from: deployer, gas }, deployResult.contract, 'init');
};
