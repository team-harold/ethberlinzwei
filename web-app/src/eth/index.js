// import ethers from 'ethers';
let ethers;
if (typeof window !== 'undefined') {
    ethers = window.ethers;
}

const contracts = {};
let provider;
let signer;

export default {
    _setup: (ethereumOrURL) => {
        if (typeof ethereumOrURL === 'string') {
            provider = new ethers.providers.JsonRpcProvider(ethereumOrURL);
        } else {
            provider = new ethers.providers.Web3Provider(ethereumOrURL);
            signer = provider.getSigner();
        }
    },
    fetchChainId: () => provider.getNetwork().then((net) => net.chainId),
    fetchAccounts: () => signer ? provider.listAccounts() : [],
    setupContracts: (contractsInfo) => {
        for (let key of Object.keys(contractsInfo)) {
            const info = contractsInfo[key];
            contracts[key] = new ethers.Contract(info.address, info.contractInfo.abi, signer || provider);
        }
    },

    join: async (joiningAge, retirementAge, monthlyPayIn) => {
        if (contracts.WelfareFund) {
            await contracts.WelfareFund.functions.join(joiningAge, retirementAge, monthlyPayIn, { gasLimit: 3000000, gasPrice: 1 });
            console.log(contracts.WelfareFund.address, ipfsURI, numNFTs, moreLater);
        } else {
            throw ('no contract WelfareFund setup');
        }
    }
};
