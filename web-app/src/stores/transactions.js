import { derived } from 'svelte/store';
import wallet from './wallet';

let $transactions = [];
export default derived(wallet, ($wallet, set) => {
    // TODO
    if ($wallet.status === 'Ready') {
        // get from localStorage.
        $transactions = [];
        set($transactions);
        wallet.onPendingTx((tx) => {
            // add to list
            // add to localStorage    
        }, true);
    } else {
        // stop listening
    }
}, $transactions);
