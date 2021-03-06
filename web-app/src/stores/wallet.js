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

const $wallet = {
    status: 'Loading',
    requestingTx: false,
};
export default (() => {
    const { subscribe, set, update } = writable();
    let contracts;
    function _set(obj) {
        for (let key of Object.keys(obj)) {
            $wallet[key] = obj[key];
        }
        log.info('WALLET', JSON.stringify($wallet, null, '  '));
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
            if ($wallet.status === 'Locked' || $wallet.status === 'Unlocking') {
                return; // skip as Unlock / post-Unlocking will fetch the account
            }
            // log.info('checking ' + accounts);
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
                    if ($wallet.status != 'WrongChain') { // TODO add Error ? Locked ?
                        log.info('now READY');
                        _set({
                            address: account,
                            status: 'Ready',
                            readOnly: undefined,
                        });
                    }
                }
            } else {
                if ($wallet.address) {
                    // if($wallet.readOnly) {
                    //     eth._setup(ethereum);
                    // }
                    if ($wallet.status != 'WrongChain') { // TODO add Error ? Locked ?
                        _set({
                            address: undefined,
                            status: 'Locked',
                            readOnly: undefined,
                        });
                    }
                }
            }
        }
        function checkChain(newChainId) {
            // log.info('checking new chain ' + newChainId);
            if ($wallet.chainId && newChainId != $wallet.chainId) {
                // log.info('from ' + $wallet.chainId + ' to ' + newChainId);
                reloadPage('networkChanged');
            }
        }
        async function watchAccounts() {
            if ($wallet.status === 'Locked' || $wallet.status === 'Unlocking') {
                return; // skip as Unlock / post-Unlocking will fetch the account
            }
            let accounts;
            try {
                accounts = await eth.fetchAccounts();
                // log.info(account ? account : 'no account');
            } catch (e) {
                log.error('watch account error', e);
            }

            checkAccounts(accounts);
        }
        async function watchChain() {
            let newChainId;
            try {
                newChainId = await eth.fetchBuiltinChainId();
            } catch (e) {
                log.error('watch account error', e);
            }

            checkChain(newChainId);
        }
        if (window.ethereum) {
            try {
                window.ethereum.once('accountsChanged', checkAccounts);
                window.ethereum.once('networkChanged', checkChain);
                window.ethereum.once('chainChanged', checkChain);
            } catch (e) {
                log.info('no ethereum.once');
            }
        }

        // TODO move that into the catch block except for Metamask

        // still need to watch as even metamask do not emit the "accountsChanged" event all the time: TODO report bug
        setInterval(watchAccounts, 1000);

        // still need to watch chain for old wallets
        setInterval(watchChain, 2000);
        return window.ethereum;
    }

    async function retry() {
        if (_retry) {
            return _retry(true);
        } else {
            throw new Error('cannot retry');
        }
    }

    async function _load({ fallbackUrl, supportedChainIds, isRetry }, setup) {
        _set({ status: 'Loading' });
        const ethereum = getEthereum();

        const isOpera = navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf("OPR/") != -1;
        let opera_enabled_before = false;
        if (isOpera) {
            opera_enabled_before = localStorage.getItem('opera_wallet_enabled');
            log.info('load', { opera_enabled_before });
        }

        let web3EnabledAndWorking = false;

        if (ethereum) {
            if (!opera_enabled_before && !isRetry && isOpera) {
                _set({
                    status: 'Opera_Locked',
                });
                return $wallet;
            }
            eth._setup(ethereum);
            web3EnabledAndWorking = true;
        } else {
            eth._setup(fallbackUrl);
            let chainId;
            try {
                chainId = await eth.fetchChainId();
            } catch (e) {
                log.error('fallback : error fetching chainId', e);
            }
            if (chainId) {
                _set({
                    status: 'NoWallet',
                    readOnly: true,
                    chainId
                });
            } else {
                _set({
                    status: 'Error',
                    error: {
                        code: 5030,
                        message: "could not detect current chain", // could try again
                    },
                    readOnly: true
                });
            }
            return $wallet;
        }
        // log.info('web3 is there...');
        // log.info('checking chainId...');
        let chainId;
        try {
            chainId = await eth.fetchChainId();
        } catch (e) {
            log.error('builtin wallet : error fetching chainId', e);
            eth._setup(fallbackUrl, ethereum);
            if (isOpera) {
                log.info('Opera web3 quircks');
                // if (isRetry) {
                //     _set({
                //         status: 'Error',
                //         error: {
                //             code: 5031,
                //             message: "Opera web3 implementation is non-standard, did you block our application or forgot to set up yoru wallet?",
                //         },
                //         readOnly: true
                //     });
                // } else {
                _set({
                    status: 'Opera_FailedChainId',
                    readOnly: true
                });
                // }
            } else {
                _set({
                    status: 'Error',
                    error: {
                        code: 5030,
                        message: "could not detect current chain",
                    },
                    readOnly: true
                });
            }
            log.info('failed to get chain Id');
            return $wallet;
        }

        if (isOpera && !opera_enabled_before) {
            localStorage.setItem('opera_wallet_enabled', true);
            log.info('opera enabled saved');
        }
        _set({ chainId });

        if (supportedChainIds.indexOf(chainId) >= 0) {
            if (setup) {
                contracts = setup($wallet);
            }

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
                log.info('already READY');
                _set({
                    address: accounts[0],
                    status: 'Ready'
                });
            } else {
                _set({ status: 'Locked' });
            }
        } else {
            log.info('wrong chain');
            eth._setup(fallbackUrl, ethereum);
            if (setup) {
                contracts = setup($wallet);
            }
            _set({
                status: 'WrongChain',
                requireManualChainReload: isOpera,
                readOnly: true
            });
        }

        if (web3EnabledAndWorking) {
            watch();
        }
        return $wallet;
    }

    let promise;
    let _retry;
    async function load({ fallbackUrl, supportedChainIds }, setup) {
        if (!process.browser) {
            _set({ status: 'Loading' });
            return $wallet;
        }
        if (promise) {
            return promise;
        }
        _retry = (isRetry) => _load({ fallbackUrl, supportedChainIds, isRetry }, setup);
        promise = _retry(false);
        return promise;
    }

    function call(options, contract, methodName, ...args) {
        // cal with from ?

        // const w = await ensureEnabled();
        // if (!w || !w.address) {
        //     throw new Error('Can\'t perform tx');
        // }
        if (typeof options === 'string') {
            if(typeof methodName !== 'undefined') {
                args.unshift(methodName);
            }
            methodName = contract;
            contract = options;
            options = undefined;
        }

        if (typeof args === 'undefined') {
            args = [];
        }

        if (contract) {
            const ethersContract = contracts[contract];
            const method = ethersContract.functions[methodName].bind(ethersContract);
            if(args.length > 0) {
                return method(...args, options || {}); // || defaultOptions);
            } else {
                return method(options || {}); // || defaultOptions);
            }
        } else {
            log.error('TODO send raw call');
        }
    }

    async function unlock() {
        log.info('Requesting unlock');
        _set({
            status: 'Unlocking'
        });
        let accounts;
        // try {
        //     accounts = await eth.fetchAccounts();
        // } catch (e) {
        //     log.info('cannot get accounts', e);
        //     accounts = [];
        // }
        // if (!accounts || accounts.length == 0) {
        // log.info('no accounts');
        try {
            accounts = await window.ethereum.enable();
        } catch (e) {
            log.info('refused to get accounts', e);
            // try {
            //     log.info('trying accounts...', e);
            //     accounts = await window.web3.eth.getAccounts();
            // } catch(e) {
            //     log.info('no accounts', e);
            accounts = [];
            // }
        }
        // }

        if (accounts.length > 0) {
            log.info('unlocked READY');
            _set({
                address: accounts[0],
                status: 'Ready'
            });
        } else {
            _set({
                status: 'Locked'
            });
            return false;
        }

        return true;
    }

    async function ensureEnabled() {
        if ($wallet.status === 'Locked') {
            await unlock();
        }
        return $wallet;
    }

    async function tx(options, contract, methodName, ...args) {
        const w = await ensureEnabled();
        if (!w || !w.address) {
            throw new Error('Can\'t perform tx');
        }
        if (typeof options === 'string') {
            if(typeof methodName !== 'undefined') {
                args.unshift(methodName);
            }
            methodName = contract;
            contract = options;
            options = undefined;
        }

        if (typeof args === 'undefined') {
            args = [];
        }

        if (options && options.from && options.from.length > 42) {
            log.error('TODO : privateKey based tx');
        } else {
            if (contract) {
                const ethersContract = contracts[contract];
                const method = ethersContract[methodName].bind(ethersContract);
                
                let tx;
                _set({
                    requestingTx: true,
                });
                try {
                    tx = await method(...args, options || {}); // || defaultOptions);
                } catch (e) {
                    tx = null;
                } finally {
                    _set({
                        requestingTx: false,
                    });
                }
                if(tx) {
                    const pendingTx = {
                        hash: tx.hash,
                        contractName: contract,
                        methodName,
                        args,
                        options
                    };
                    emitTransaction(pendingTx, $wallet.chainId, $wallet.address);
                }
            } else {
                log.error('TODO send raw tx');
            }
        }
    }

    function emitTransaction(tx, chainId, address) {
        for (let callback of transactionCallbacks) {
            callback(tx, chainId, address);
        }
    }

    const transactionCallbacks = [];
    function onTransactionBroadcasted(callback) {
        transactionCallbacks.push(callback);
    }

    return { load, retry, unlock, subscribe, onTransactionBroadcasted, tx, call, reloadPage: () => reloadPage('requested', true) };
})();
