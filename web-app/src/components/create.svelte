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

<style>
    .harold-form {
        width: 50px;
    }

    #harold-ages {
        border-bottom: #616161 solid 1px;
    }

    label {
        font-size: 20px;
        margin: 10px 0 10px 0;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border: 1px solid #ffffff;
        height: 18px;
        width: 18px;
        border-radius: 2px;
        background: #ff2968;
        cursor: pointer;
        box-shadow: 1px 1px 1px #616161, 0px 0px 1px #0d0d0d;
    }
</style>


<section class="action-section">
    <h1> Your pension plan </h1>

    <div class="d-flex flex-row align-items-center mb-1">
        <span style="font-size: 15px; color: #00e8d5; padding-right: 10px">
            <i class="fas fa-user-astronaut"></i>
        </span>
        <h4 id='account'>
            {($wallet.address && $wallet.status == 'Ready') ? $wallet.address : 'Web3 account not available'}</h4>
    </div>

    <form id="harold-ages" class="d-flex flex-row justify-content-between py-3">
        <div class="d-flex flex-column mb-3 align-items-start">
            <h3 class="bd-highlight">Your age</h3>
            <input type="text" class="harold-form" bind:value={inputJoiningAge}>
        </div>

        <div class="d-flex flex-column mb-3 align-items-start">
            <h3 class="bd-highlight">Retirement age</h3>
            <input type="text" class="harold-form" bind:value={inputRetirementAge}>
        </div>
    </form>

</section>


<section class="py-3 d-flex flex-column justify-content-between action-section">

    <div class="d-flex flex-row align-items-center mb-1">
        <span style="font-size: 20px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-wallet"></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay In: <span style="color: #ff2968">{monthlyPayIn.toFixed(1)}</span>
            DAI</label>
    </div>

    <input bind:value={monthlyPayIn} type="range" class="custom-range" id="monthlyPayInRange" min="1" max="10000">

    <h2 class="py-4 my-1"><em> {yearsTillRetire} </em></h2>

    <div class="d-flex flex-row justify-content-start align-items-center mb-1">
        <span style="font-size: 20px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-money-bill-alt"></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay Out: <span style="color: #ff2968">{monthlyPayOut.toFixed(1)}</span>
            DAI</label>
    </div>

    <input bind:value={monthlyPayOut} type="range" class="custom-range" id="monthlyPayInRange" min="1" max="100000">

</section>

<footer class="text-center mt-5">
    <!-- join: async (joiningAge, retirementAge, monthlyPayIn) -->
    <button
        on:click="{() => wallet.tx('Pension', 'join', inputJoiningAge, inputRetirementAge, monthlyPayIn)}">Create
        Your Plan</button>
</footer>