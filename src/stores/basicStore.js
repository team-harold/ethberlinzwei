import { writable, readable, derived } from 'svelte/store';
import log from '../util/log';
import eth from '../eth';
import * as axios from 'axios';

let $contracts = {};
export default (() => {
    const { subscribe, set, update } = writable();


    return { load, subscribe };
})();