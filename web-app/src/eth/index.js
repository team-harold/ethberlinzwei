// import ethers from 'ethers';
let ethers;
if (typeof window !== 'undefined') {
    ethers = window.ethers;
}

let contracts = {};
let provider;
let signer;
let builtinProvider;

export default {
    _setup: (ethereumOrURL, ethereum) => {
        if (typeof ethereumOrURL === 'string') {
            provider = new ethers.providers.JsonRpcProvider(ethereumOrURL);
            if (ethereum) {
                builtinProvider = new ethers.providers.Web3Provider(ethereum);
            } else {
                builtinProvider = provider;
            }
        } else {
            provider = new ethers.providers.Web3Provider(ethereumOrURL);
            builtinProvider = provider;
            signer = provider.getSigner();
        }
    },
    fetchChainId: () => provider.getNetwork().then((net) => "" + net.chainId),
    fetchBuiltinChainId: () => builtinProvider.getNetwork().then((net) => "" + net.chainId),
    fetchAccounts: () => signer ? provider.listAccounts() : [],
    setupContracts: (contractsInfo) => {
        contracts = {};
        for (let key of Object.keys(contractsInfo)) {
            const info = contractsInfo[key];
            contracts[key] = new ethers.Contract(info.address, info.contractInfo.abi, signer || provider);
        }
        return contracts;
    },
    getTransactionReceipt: async (txHash) => {
        let p = await provider.getTransactionReceipt(txHash);
        return p;
    },

};
