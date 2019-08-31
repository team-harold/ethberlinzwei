import { writable, readable, derived } from 'svelte/store';
import wallet from './wallet';
import log from '../util/log';

const $data = {};
let interval;
export default derived(wallet, ($wallet, set) => {
    function _set(obj) {
        let diff = 0;
        for (let key of Object.keys(obj)) {
            if ($data[key] !== obj[key]) {
                $data[key] = obj[key];
                diff++;
            }
        }
        if (diff > 0) {
            log.info('CONTRACT DATA', JSON.stringify($data, null, '  '));
            set($data);
        }
    }

    async function fetch() {
        const stages = ['retired', 'paying', 'dead'];
        const result = await wallet.call('WelfareFund', 'isJoined', $wallet.address);
        _set({
            status: 'Loaded',
            // TODO block,
            joined: result[0],
            stage: stages[result[1]],
        });
    }

    async function startListening() {
        if (!interval) {
            fetch();
            interval = setInterval(() => {
                fetch();
            }, 5000); // TODO config interval
            console.log('start listenning', interval);
        }
    }

    async function stopListening() {
        console.log('stop listenning', interval);
        if (interval) {
            console.log('stop listenning');
            clearInterval(interval);
        }
        interval = undefined;
    }

    if ($wallet.status === 'Ready') {
        _set({
            status: 'Loading', // TODO only if no data already available ?
            userStatus: undefined,
            joined: undefined,
        });
        startListening();
    } else {
        console.log('not ready now');
        stopListening(); // TODO Should we stop listening ?
        _set({
            status: 'Unset',
            userStatus: undefined,
            joined: undefined,
        });
    }
});
