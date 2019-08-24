const { deploy } = require('rocketh-ethers')(require('rocketh'), require('ethers'));

module.exports = async ({ chainId, accounts, initialRun, namedAccounts, registerDeployment }) => {
    const deployer = accounts[0];
    const gas = 3000000;

    const deployResult = await deploy(
        'WelfareFund',
        { from: deployer, gas },
        'WelfareFund',
    );

    if (initialRun) {
        console.log('WelfareFund gas used', deployResult.receipt.gasUsed.toString(10));
    }
};
