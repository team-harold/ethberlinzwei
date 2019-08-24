import wallet from './stores/wallet';
import contractsInfo from './contractsInfo';
import eth from './eth';

export default () => {
    wallet.load(4, () => {
        eth.setupContracts(contractsInfo);
    });
};
