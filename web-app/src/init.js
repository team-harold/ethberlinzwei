import wallet from './stores/wallet';
import eth from './eth';

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

export default async () => {
    let contractsInfo;
    let dev = false;

    // TODO check env:
    // console.log('ENV', JSON.stringify(process.env));
    // if (process.env.NODE_ENV === 'production') {
    //     contractsInfo = require('./contractsInfo.json');
    // } else {
    try {
        contractsInfo = require('./dev_contractsInfo.json');
        dev = true;
    } catch (e) {
        console.log('error getting dev_contractsInfo.json', e);
        contractsInfo = require('./contractsInfo.json');
    }
    // }



    // TODO default to dev if web page loaded from localhost or if using dev_contractsInfo.json

    let supportedChainIds = Object.keys(contractsInfo);
    let fallbackUrl;
    if (dev) {
        fallbackUrl = 'http://localhost:8545';
    } else if (contractsInfo['1']) {
        fallbackUrl = 'https://mainnet.infura.io/v3/c985560c1dc04aed8f2c0300aa5f5efa';
    } else if (contractsInfo['4']) {
        fallbackUrl = 'https://rinkeby.infura.io/v3/c985560c1dc04aed8f2c0300aa5f5efa';
    } else {
        fallbackUrl = 'http://localhost:8545';
    }
    if (process.browser) {
        fallbackUrl = findGetParameter('fallbackUrl') || fallbackUrl;
    }

    await wallet.load({ fallbackUrl, supportedChainIds }, ($wallet) => {
        if ($wallet && $wallet.chainId) {
            const chainId = $wallet.chainId;
            if (contractsInfo[chainId]) {
                console.log('setting up contract for chainId', contractsInfo[chainId]);
                return eth.setupContracts(contractsInfo[chainId]);
            } else {
                console.log('no contract for chainId ' + chainId);
            }
        } else {
            if (process.browser) {
                // TODO ?
                console.log('could not compute $wallet.chainId');
            }
        }
        return {};
    });
};
