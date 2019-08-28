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
    let contracts;
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
                contracts = setup($wallet);
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

    async function ensureEnabled() {
        if($wallet.status === 'Locked') {
            await unlock();
        }
        return $wallet;
    }

    async function tx(options, contract, methodName, ...args) {
        const w = await ensureEnabled();
        if(!w || !w.address) {
            throw new Error('Can\'t perform tx');
        }
        if(typeof options === 'string') {
            args.unshift(methodName);
            methodName = contract;
            contract = options;
            options = undefined;
        }
        if(options && options.from && options.from.length > 42) {
            // TODO
            // const privateKey = options.from;
            // const from = web3.eth.accounts.privateKeyToAccount(privateKey).address;
            // const nonce = web3.utils.toHex(options.nonce || await web3.eth.getTransactionCount(from));
            // const gas = web3.utils.toHex(options.gas);
            // const value = options.value || "0x0";
            // const gasPrice = options.gasPrice || await web3.eth.getGasPrice();
            // let data = options.data;
            // let to = options.to;
            // if(contract) {
            //     to = contract.options.address;
            //     data = contract.methods[methodName](...args).encodeABI();
            // }
            // const txOptions = {
            //     from,
            //     nonce,
            //     gas,
            //     value,
            //     gasPrice,
            //     data,
            //     to
            // };
            // const signedTx = await web3.eth.accounts.signTransaction(txOptions, privateKey);
            // return web3.eth.sendSignedTransaction(signedTx.rawTransaction);                    
        } else {
            if(contract) {
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
                // TODO return web3.eth.sendTransaction(options);
            }
        }
    }
    const pendingTransactionCallbacks = [];
    const pendingTransactions = [];
    function addPendingTransaction(pendingTx) {
        pendingTransactions.push(pendingTx);
        for(let callback of pendingTransactionCallbacks) {
            callback(pendingTx);
        }
        if(pendingTransactions.length == 1) {
            checkPendingTransactions();
        }
    }

    function removePendingTransaction(txHash) {
        for(let pendingTx of pendingTransactions) {
            if(pendingTx.hash == txHash) {
                pendingTransactions.splice(i, 1);
                // should not be duplicated : 
            }
        }
        // TODO emit callback
    }

    async function checkPendingTransactionsOneByeOne(txHash) {
        for(let pendingTx of pendingTransactions) {
            const receipt = await eth.getTransactionReceipt(pendingTx.hash);
            if(receipt) {
                // console.log('MINED', receipt);
                if(receipt.status == 1) {

                } else {

                }
                if(receipt.confirmations > 12) { // TODO config
                    // TODO notify final status
                    removePendingTransaction(pendingTx.hash);
                }
            }
        }
    }

    async function checkPendingTransactions() {

        await checkPendingTransactionsOneByeOne();
        
        if(pendingTransactions.length > 0) {
            setTimeout(checkPendingTransactions, 5000); // TODO config interval
        }
    }

    function onPendingTx(callback, emitPrevious) {
        if(emitPrevious) {
            for(let pendingTx of pendingTransactions) {
                callback(pendingTx);
            }
        }
        pendingTransactionCallbacks.push(callback);
    }

    // function cancelPendingTxCallback(callback) {
    //     // TODO
    // }

    return { load, unlock, subscribe, onPendingTx, tx };
})();
