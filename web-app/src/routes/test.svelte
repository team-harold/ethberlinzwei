<script>
    import eth from '../eth';
    import annuity from '../math/annuity';
    import { beforeUpdate, afterUpdate } from 'svelte';

    let joiningAge = 1;
    let retirementAge = 65;
    let monthlyPayIn = 1;
    let monthlyPayOut = 1;

    let last_monthlyPayIn = 0;
    let last_monthlyPayOut = 0;

    afterUpdate(() => {
        if (last_monthlyPayIn != monthlyPayIn) {
            monthlyPayOut = annuity.payOutPerMonth(retirementAge, joiningAge, monthlyPayIn);
        } else if (last_monthlyPayOut != last_monthlyPayOut) {
            monthlyPayIn = annuity.payInPerMonth(retirementAge, joiningAge, monthlyPayOut);
        } else {
            monthlyPayIn = annuity.payInPerMonth(retirementAge, joiningAge, monthlyPayOut);
        }
        last_monthlyPayIn = monthlyPayIn;
        last_monthlyPayOut = monthlyPayOut;

        console.log({ retirementAge, joiningAge, monthlyPayIn, monthlyPayOut });
    });

</script>

<style>
    h1 {
        color: purple;
    }
</style>

<label>joiningAge</label><input type=range bind:value={joiningAge} min=1 max=100 /><br />
<label>retirementAge</label><input type=range bind:value={retirementAge} min=30 max=100 /><br />
<label>monthlyPayIn</label><input type=range bind:value={monthlyPayIn} min=1 max=1000 /><br />
<label>monthlyPayOut</label><input type=range bind:value={monthlyPayOut} min=1 max=1000 /><br />

<button on:click="{() => eth.join()}">Join DAO</button>