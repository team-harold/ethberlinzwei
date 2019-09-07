import { writable, readable, derived } from 'svelte/store';
import { BigNumber } from 'ethers';
import wallet from './wallet';
import log from '../util/log';

const $data = {
    status: 'Loading',
    debug_timeDelta: BigNumber.from(0),
    retirementTime: BigNumber.from(0),
    contribution: BigNumber.from(0),
};
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
        // TODO fetch on specific block (BlockBeat)
        const personData = await wallet.call('Pension', 'getPersonData', $wallet.address);

        const debug_timeDelta = await wallet.call('Pension', 'getTimeDelta');
        _set({
            status: 'Loaded',
            // TODO block,
            joiningAge: personData.joiningAge,
            payInPerMonth: personData.payInPerMonth,
            payOutPerMonth: personData.payOutPerMonth,
            retirementTime: personData.retirementTime,
            startTime: personData.startTime,
            contribution: personData.contribution,
            totalPaidOut: personData.totalPaidOut,
            debug_timeDelta
        });
    }

    async function startListening() {
        if (!interval) {
            _set({
                status: 'Loading', // TODO only if no data already available ?
            });
            fetch();
            interval = setInterval(() => {
                fetch();
            }, 5000); // TODO config interval
            console.log('start listenning', interval);
        }
    }

    async function stopListening() {
        // console.log('stop listenning', interval);
        if (interval) {
            // console.log('stop listenning');
            clearInterval(interval);
        }
        interval = undefined;
    }

    if ($wallet.status === 'Ready') {
        startListening();
    } else {
        // console.log('not ready now');
        stopListening(); // TODO Should we stop listening ?
        _set({ status: 'Unset' });
    }
}, $data);
