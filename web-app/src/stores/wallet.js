import { writable, readable, derived } from 'svelte/store';
import log from '../util/log';
import eth from '../eth';

// import Portis from '@portis/web3';
// import { Bitski, AuthenticationStatus } from 'bitski';
// import axios from 'axios';

function reloadPage(reason, instant) {
    log.info((instant ? 'instant ' : '') + 'reloading page because ' + reason);
    if (instant) {
        window.location.reload();
    } else {
        setTimeout(() => window.location.reload(), 100);
    }
}

function fallback(callback) {
    eth._setup('https://rinkeby.infura.io/v3/c985560c1dc04aed8f2c0300aa5f5efa');
    if (callback) { callback(); }
}
let $wallet = {};
export default (() => {
    const { subscribe, set, update } = writable();
    function _set(obj) {
        for (let key of Object.keys(obj)) {
            $wallet[key] = obj[key];
        }
        log.info(JSON.stringify($wallet, null, '  '));
        set($wallet);
    }

    function getEthereum() {
        if (window.ethereum) {
            return window.ethereum;
        } else if (window.web3) {
            return window.web3.currentProvider;
        }
        return null;
    }

    function watch() {
        function checkAccounts(accounts) {
            log.info('checking ' + accounts);
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                if ($wallet.address) {
                    if (account.toLowerCase() !== $wallet.address.toLowerCase()) {
                        reloadPage('accountsChanged', true);
                    }
                } else {
                    // if($wallet.readOnly) {
                    //     eth._setup(ethereum);
                    // }
                    _set({
                        address: account,
                        status: 'Ready',
                        readOnly: undefined,
                    });
                }
            } else {
                if ($wallet.address) {
                    // if($wallet.readOnly) {
                    //     eth._setup(ethereum);
                    // }
                    _set({
                        address: undefined,
                        status: 'Locked',
                        readOnly: undefined,
                    });
                }
            }
        }
        async function watchAccounts() {
            let accounts;
            try {
                accounts = await eth.fetchAccounts();
                // log.info(account ? account : 'no account');
            } catch (e) {
                log.error('watch account error', e);
            }

            checkAccounts(accounts);
        }
        if (window.ethereum) {
            try {
                window.ethereum.once('accountsChanged', (accounts) => {
                    checkAccounts(accounts);
                });
                window.ethereum.once('networkChanged', (newChainId) => {
                    if ($wallet.chainId && newChainId != $wallet.chainId) {
                        reloadPage('networkChanged');
                    }
                });
                window.ethereum.once('chainChanged', (newChainId) => {
                    if ($wallet.chainId && newChainId != $wallet.chainId) {
                        reloadPage('chainChanged');
                    }
                });
            } catch (e) {
                log.info('no ethereum.once');
            }
        }
        // still need to watch as even metamask do not emit the "accountsChanged" event all the time: TODO report bug
        setInterval(watchAccounts, 1000);
        return window.ethereum;
    }

    let promise;
    async function load(chainIdExpected, callback) { // TODO allow chainId to be provided as an array and also as a promise return function
        if (!process.browser) {
            _set({ status: 'Loading' });
            return true;
        }
        if (promise) {
            return promise;
        }
        promise = (async () => {
            _set({ status: 'Loading' });
            const ethereum = getEthereum();

            if (ethereum) {
                eth._setup(ethereum);
                if (callback) { callback(); }
                watch();
            } else {
                fallback(callback);
                _set({
                    status: 'NoWallet',
                    readOnly: true
                });
                return;
            }
            log.info('web3 is there...');
            log.info('checking chainId...');
            let chainId;
            try {
                chainId = await eth.fetchChainId();
            } catch (e) {
                fallback();
                if (navigator.userAgent.indexOf("Opera") != -1 ||
                    navigator.userAgent.indexOf("OPR/") != -1) {
                    log.info('Opera web3 quircks');
                    _set({
                        status: 'Locked',
                        readOnly: true
                    }); // TOdO Error
                } else {
                    log.error('failed to get chainId', e);
                    _set({
                        status: 'Locked',
                        readOnly: true
                    });
                }
                return;
            }

            _set({ chainId });

            if (chainId == chainIdExpected) {
                let accounts;
                try {
                    log.info('getting accounts..');
                    accounts = await eth.fetchAccounts();
                    log.info('accounts', accounts);
                } catch (e) {
                    log.error('accounts', e);
                    accounts = undefined;
                }
                if (accounts && accounts.length > 0) {
                    _set({
                        address: accounts[0],
                        status: 'Ready'
                    });
                } else {
                    _set({ status: 'Locked' });
                }
            } else {
                log.info('wrong chain');
                fallback();
                _set({
                    status: 'WrongChain',
                    readOnly: true
                });
            }
        })();
        return promise;
    }
    return { load, subscribe };
})();
