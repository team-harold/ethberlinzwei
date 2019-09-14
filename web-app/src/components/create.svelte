<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';

    let monthlyPayIn = 12;
    let monthlyPayOut = 12;
    let inputJoiningAge = 18;
    let inputRetirementAge = 60;
    let last_monthlyPayIn = 0;
    let last_monthlyPayOut = 0;
    let loadingTransaction = false;

    $: isValidRetirementAge = inputRetirementAge > inputJoiningAge ?
        '' : 'border: 1px solid  #ff2968; color: #ff2968;'
    $: ytr = parseInt(inputRetirementAge) - parseInt(inputJoiningAge)
    $: yearsTillRetire = ytr > 0 ? 'After ' + ytr + ' years...' : 'Invalid age selection'


    afterUpdate(() => {
        inputJoiningAge = inputJoiningAge > 1 ? inputJoiningAge : 1;
        let joiningAge = inputJoiningAge > 1 ? inputJoiningAge : 1;
        let retirementAge = inputRetirementAge > inputJoiningAge ? inputRetirementAge : joiningAge;

        if (last_monthlyPayIn != monthlyPayIn) {
            monthlyPayOut = annuity.payOutPerMonth(retirementAge, joiningAge, monthlyPayIn);
        } else if (last_monthlyPayOut != last_monthlyPayOut) {
            monthlyPayIn = annuity.payInPerMonth(retirementAge, joiningAge, monthlyPayOut);
        } else {
            let mpi = annuity.payInPerMonth(retirementAge, joiningAge, monthlyPayOut)
            monthlyPayIn = isNaN(mpi) ? last_monthlyPayIn : mpi;
        }
        last_monthlyPayIn = monthlyPayIn;
        last_monthlyPayOut = monthlyPayOut;
    });
</script>


<section >
    <h1> Your pension plan </h1>

    <div >
        <span >
            <i ></i>
        </span>
        <h4 id='account'>
            {($wallet.address && $wallet.status == 'Ready') ? $wallet.address : 'Web3 account not available'}</h4>
    </div>

    <form id="harold-ages" >
        <div >
            <h3 >Your age</h3>
            <input type="text"  bind:value={inputJoiningAge}>
        </div>

        <div >
            <h3 >Retirement age</h3>
            <input type="text"  bind:value={inputRetirementAge}>
        </div>
    </form>

</section>


<section >

    <div >
        <span >
            <i ></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay In: <span >{monthlyPayIn.toFixed(1)}</span>
            DAI</label>
    </div>

    <input bind:value={monthlyPayIn} type="range" >

    <h2 ><em> {yearsTillRetire} </em></h2>

    <div >
        <span >
            <i ></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay Out: <span >{monthlyPayOut.toFixed(1)}</span>
            DAI</label>
    </div>

    <input bind:value={monthlyPayOut} type="range" >

</section>

<footer >
    <!-- join: async (joiningAge, retirementAge, monthlyPayIn) -->
    <button
        on:click="{() => wallet.tx('Pension', 'join', inputJoiningAge, inputRetirementAge, monthlyPayIn)}">Create
        Your Plan</button>
</footer>