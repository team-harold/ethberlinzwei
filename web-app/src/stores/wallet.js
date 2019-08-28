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
    async function load({fallbackUrl, supportedChainIds}, setup) {
        if (!process.browser) {
            _set({ status: 'Loading' });
            return $wallet;
        }
        if (promise) {
            return promise;
        }

        promise = (async () => {
            _set({ status: 'Loading' });
            const ethereum = getEthereum();

            if (ethereum) {
                eth._setup(ethereum);
                watch();
            } else {
                eth._setup(fallbackUrl);
                let chainId;
                try {
                    chainId = await eth.fetchChainId();
                } catch (e) {

                }
                _set({
                    status: 'NoWallet',
                    readOnly: true,
                    chainId
                });
                if(chainId) {
                    return $wallet;
                } else {
                    return $wallet;
                }
            }
            log.info('web3 is there...');
            log.info('checking chainId...');
            let chainId;
            try {
                chainId = await eth.fetchChainId();
            } catch (e) {
                console.error(e);
                eth._setup(fallbackUrl);
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
                return $wallet;
            }

            _set({ chainId });

            if (supportedChainIds.indexOf(chainId) >= 0) {
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
                eth._setup(fallbackUrl);
                _set({
                    status: 'WrongChain',
                    readOnly: true
                });
            }
            if(setup) {
                setup($wallet);
            }
            // console.log('$wallet', $wallet);
            return $wallet;
        })();
        return promise;
    }

    async function unlock() {
        log.info('Requesting unlock');
        _set({
            status: 'Unlocking'
        });
        let accounts;
        try {
            accounts = await window.ethereum.enable();
        } catch (e) {
            // try {
            //     log.info('trying accounts...', e);
            //     accounts = await window.web3.eth.getAccounts();
            // } catch(e) {
            //     log.info('no accounts', e);
            accounts = [];
            // }
        }

        if (accounts.length > 0) {
            lastAccount = accounts[0];
            _set({
                address: accounts[0],
                status: 'Unlocking'
            });
        } else {
            _set({
                status: 'Locked'
            });
            return false;
        }

        return true;
    }

    return { load, unlock, subscribe };
})();
