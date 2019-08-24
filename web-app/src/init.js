import wallet from './stores/wallet';
import contractsInfo from './contractsInfo';
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

export default () => {
    let chainId = 4;
    if (process.browser) {
        chainId = findGetParameter('chainId') || chainId;
    }
    wallet.load(chainId, async () => {
        const currentChainId = await eth.fetchChainId();
        if (chainId == currentChainId) {
            try {
                console.log('setting up contract for chainId', contractsInfo[chainId]);
                eth.setupContracts(contractsInfo[chainId]);
            } catch (e) {
                console.log('no contract for chainId ' + currentChainId);
            }
        }
    });
};
