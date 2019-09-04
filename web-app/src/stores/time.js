import { writable } from 'svelte/store';

export const everySecond = (() => {
    const { subscribe, set } = writable(0);
    set(Math.floor(Date.now() / 1000));
    setInterval(() => {
        set(Math.floor(Date.now() / 1000));
    }, 1000);
    return { subscribe };
})();

