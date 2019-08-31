import { derived } from 'svelte/store';
import wallet from './wallet';
import log from '../util/log';
import eth from '../eth';

let $transactions = {
    status: 'Loading',
    list: [],
    numUnConfirmed: 0,
};
let lastAddress;
let lastChainId;
let initialised;
let timeout;
let stopping;
let started;


export default derived(wallet, ($wallet, set) => {
    function _set(obj) {
        let diff = 0;
        for (let key of Object.keys(obj)) {
            if ($transactions[key] !== obj[key]) {
                $transactions[key] = obj[key];
                diff++;
            }
        }
        if (diff > 0) {
            log.info('TRANSACTION DATA', JSON.stringify($transactions, null, '  '));
            set($transactions);
        }
    }

    if (!initialised) {
        log.info('INITIALISED');
        initialised = true;
        wallet.onTransactionBroadcasted((tx) => {
            log.info('NEW TX', tx);
            $transactions.list.push(tx);
            _set({
                list: $transactions.list,
                numUnConfirmed: $transactions.numUnConfirmed + 1,
            });
            saveToLocalStorage(lastChainId, lastAddress);
            // startListening();
        }, true);
    }

    function removeTransaction(txHash) {
        let i = 0;
        for (let tx of $transactions.list) {
            if (tx.hash == txHash) {
                $transactions.list.splice(i, 1);
                _set({
                    list: $transactions.list,
                });
                saveToLocalStorage(lastChainId, lastAddress);
            }
            i++;
        }
    }

    async function checkTransactionsOneByeOne() {
        let numUnConfirmed = 0;
        for (let tx of $transactions.list) {
            const receipt = await eth.getTransactionReceipt(tx.hash);
            if (stopping) {
                return;
            }
            if (receipt) {
                if (receipt.status == 1) {
                    log.info('SUCCESS', tx.hash);
                } else {
                    log.info('FAILURE', tx.hash);
                }
                log.info(receipt);
                if (receipt.confirmations == 0) {
                    numUnConfirmed++;
                }
                if (receipt.confirmations > 6) { // TODO config
                    log.info('tx removed', tx.hash);
                    // TODO notify final status
                    removeTransaction(tx.hash);
                }
            } else {
                numUnConfirmed++;
            }
        }
        _set({
            status: 'Loaded',
            numUnConfirmed
        });
    }

    async function checkTransactions() {
        await checkTransactionsOneByeOne();
        if (!stopping) {
            timeout = setTimeout(checkTransactions, 5000); // TODO config interval
        }
    }

    async function startListening() {
        stopping = false;
        if (!started) {
            started = true;
            checkTransactions();
        }
    }

    async function stopListening() {
        stopping = true;
        started = false;
        if (timeout) {
            clearTimeout(timeout);
        }
    }

    function collectFromLocalStorage(chainId, address) {
        let transactions;
        try {
            transactions = JSON.parse(localStorage.getItem('tx_' + chainId + '_' + address));
        } catch (e) {
            log.error('local storage reading error', e);
            transactions = [];
        }
        if (!transactions) {
            transactions = [];
        }
        if (transactions.length === 0) {
            _set({
                status: 'Loaded',
                list: transactions,
                numUnConfirmed: 0,
            });
        } else {
            _set({
                status: 'Loading',
                list: transactions,
                numUnConfirmed: undefined,
            });
        }
    }
    function saveToLocalStorage(chainId, address) {
        try {
            localStorage.setItem('tx_' + chainId + '_' + address, JSON.stringify($transactions.list));
        } catch (e) {
            log.error('local storage writing error', e);
        }
    }

    if ($wallet.address) {
        if ($wallet.address !== lastAddress || $wallet.chainId !== lastChainId) {
            collectFromLocalStorage($wallet.chainId, $wallet.address);
            if (!lastAddress) {
                startListening();
            }
            lastAddress = $wallet.address;
            lastChainId = $wallet.chainId;
        }
    } else {
        if (lastAddress) {
            _set({
                status: 'Loaded',
                list: [],
                numUnConfirmed: 0,
            });
            stopListening();
            lastAddress = undefined;
        }
    }
}, $transactions);
