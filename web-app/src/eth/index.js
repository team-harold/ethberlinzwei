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
    fetchChainId: () => provider.getNetwork().then((net) => "" + net.chainId),
    fetchAccounts: () => signer ? provider.listAccounts() : [],
    setupContracts: (contractsInfo) => {
        for (let key of Object.keys(contractsInfo)) {
            const info = contractsInfo[key];
            contracts[key] = new ethers.Contract(info.address, info.contractInfo.abi, signer || provider);
        }
    },
    getTransactionReceipt: async (txHash) => {
        let p = await provider.getTransactionReceipt(txHash);
        return p;
    },
    join: (joiningAge, retirementAge, monthlyPayIn) => {
        console.log("joiningAge: ", joiningAge);
        console.log("retirementAge: ", retirementAge);
        console.log("monthlyPayIn: ", monthlyPayIn);
        if (contracts.WelfareFund) {
            console.log("submitting");
            return contracts.WelfareFund.join(joiningAge, retirementAge, monthlyPayIn, { gasLimit: 3000000 });
        } else {
            throw ('no contract WelfareFund setup');
        }
    },
    payIn: (value) => {
        console.log('paying value: ', value);
        return contracts.WelfareFund.payIn({ gasLimit: 3000000, value: value });
    },
    withdraw: () => {
        return contracts.WelfareFund.claimPayOut();
    },
    getPayIn: async (addr) => {
        return contracts.WelfareFund.getPayIn(addr);
    },
    claimPayOut: () => {return {payoutAmount: 740};
    },          
    isJoined: async (addr) => {
        return contracts.WelfareFund.isJoined(addr);
        // status: 'dead' //paying, dead, null
    },
};
