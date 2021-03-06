const { deploy, getDeployedContract } = require('rocketh-ethers')(require('rocketh'), require('ethers'));

module.exports = async ({ chainId, accounts, initialRun, namedAccounts, registerDeployment }) => {
    const deployer = accounts[0];
    const gas = 3000000;
    const contractName = 'AlwaysEligibleUnlessDead';

    const deathOracle = getDeployedContract('Ankou');
    const deployResult = await deploy(
        contractName,
        { from: deployer, gas },
        contractName,
        deathOracle.address,
    );

    if (initialRun) {
        console.log(contractName + ' deployed used  ' + deployResult.receipt.gasUsed.toString() + ' gas');
    }
};
