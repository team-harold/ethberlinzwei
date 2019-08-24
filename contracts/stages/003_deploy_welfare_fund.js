const { deploy, getDeployedContract, tx } = require('rocketh-ethers')(require('rocketh'), require('ethers'));

module.exports = async ({ chainId, accounts, initialRun, namedAccounts, registerDeployment }) => {
    const deployer = accounts[0];
    const gas = 3000000;
    const contractName = 'WelfareFund';

    const eligibilityOracle = getDeployedContract('AlwaysEligibleUnlessDead');
    const deployResult = await deploy(
        contractName,
        { from: deployer, gas },
        contractName,
        [], eligibilityOracle.address, // TODO mortability table
    );

    if (initialRun) {
        console.log(contractName + ' deployed used  ' + deployResult.receipt.gasUsed.toString(10) + ' gas');
    }

    await tx({ from: deployer, gas }, deployResult.contract, 'init');
};
