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

const $wallet = {};
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
                        console.log('now READY');
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
                // console.log('from ' + $wallet.chainId + ' to ' + newChainId);
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
            console.log('load', { opera_enabled_before });
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
        log.info('web3 is there...');
        log.info('checking chainId...');
        let chainId;
        try {
            chainId = await eth.fetchChainId();
        } catch (e) {
            console.error(e);
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
                log.error('failed to get chainId', e);
                _set({
                    status: 'Error',
                    error: {
                        code: 5030,
                        message: "could not detect current chain",
                    },
                    readOnly: true
                });
            }
            console.log('failed to get chain Id');
            return $wallet;
        }

        if (isOpera && !opera_enabled_before) {
            localStorage.setItem('opera_wallet_enabled', true);
            console.log('opera enabled saved');
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
                console.log('already READY');
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
        // console.log('$wallet', $wallet);
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
            args.unshift(methodName);
            methodName = contract;
            contract = options;
            options = undefined;
        }

        if (contract) {
            const ethersContract = contracts[contract];
            const method = ethersContract.functions[methodName].bind(ethersContract);
            return method(...args, options || {}); // || defaultOptions);
        } else {
            console.error('TODO send raw call');
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
        //     console.log('cannot get accounts', e);
        //     accounts = [];
        // }
        // if (!accounts || accounts.length == 0) {
        // console.log('no accounts');
        try {
            accounts = await window.ethereum.enable();
        } catch (e) {
            console.log('refused to get accounts', e);
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
            console.log('unlocked READY');
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
            args.unshift(methodName);
            methodName = contract;
            contract = options;
            options = undefined;
        }
        if (options && options.from && options.from.length > 42) {
            console.error('TODO : privateKey based tx');
        } else {
            if (contract) {
                const ethersContract = contracts[contract];
                const method = ethersContract[methodName].bind(ethersContract);
                const tx = await method(...args, options); // || defaultOptions);
                const pendingTx = {
                    hash: tx.hash,
                    contractName: contract,
                    methodName,
                    args,
                    options
                };
                addPendingTransaction(pendingTx);
            } else {
                console.error('TODO send raw tx');
            }
        }
    }
    const pendingTransactionCallbacks = [];
    const pendingTransactions = [];
    function addPendingTransaction(pendingTx) {
        pendingTransactions.push(pendingTx);
        for (let callback of pendingTransactionCallbacks) {
            callback(pendingTx);
        }
        if (pendingTransactions.length == 1) {
            checkPendingTransactions();
        }
    }

    function removePendingTransaction(txHash) {
        for (let pendingTx of pendingTransactions) {
            if (pendingTx.hash == txHash) {
                pendingTransactions.splice(i, 1);
                // should not be duplicated : 
            }
        }
        // TODO emit callback
    }

    async function checkPendingTransactionsOneByeOne(txHash) {
        for (let pendingTx of pendingTransactions) {
            const receipt = await eth.getTransactionReceipt(pendingTx.hash);
            if (receipt) {
                // console.log('MINED', receipt);
                if (receipt.status == 1) {

                } else {

                }
                if (receipt.confirmations > 12) { // TODO config
                    // TODO notify final status
                    removePendingTransaction(pendingTx.hash);
                }
            }
        }
    }

    async function checkPendingTransactions() {

        await checkPendingTransactionsOneByeOne();

        if (pendingTransactions.length > 0) {
            setTimeout(checkPendingTransactions, 5000); // TODO config interval
        }
    }

    function onPendingTx(callback, emitPrevious) {
        if (emitPrevious) {
            for (let pendingTx of pendingTransactions) {
                callback(pendingTx);
            }
        }
        pendingTransactionCallbacks.push(callback);
    }

    // function cancelPendingTxCallback(callback) {
    //     // TODO
    // }

    return { load, retry, unlock, subscribe, onPendingTx, tx, call, reloadPage: () => reloadPage('requested', true) };
})();
