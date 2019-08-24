<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import { beforeUpdate, afterUpdate } from 'svelte';

    let monthlyPayIn = 0;
    let monthlyPayOut = 0;
    let joiningAge = 18;
    let targetRetireAge = 60
    $:yearsTillRetire = parseInt(targetRetireAge) - parseInt(joiningAge)

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
#account {
    background: url(account.png) no-repeat left;
    background-size: 15px 15px;
    padding-left: 21px;
}

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

<section>
    <h1> Explore your pension plan </h1>

    <h4 id='account'>{($wallet.address && $wallet.status == 'Ready') ? $wallet.address : 'Web3 account not available'}</h4>

    <div id="harold-ages" class="d-flex flex-row justify-content-around py-3">
        <div class="d-flex flex-column mb-3 align-items-start">
        <h3 class="bd-highlight">Your age</h3>
        <input type="text" class="harold-form" bind:value={joiningAge}>
        </div>

        <div class="d-flex flex-column mb-3 align-items-start">
        <h3 class="bd-highlight">Retirement age</h3>
        <input type="text" class="harold-form" bind:value={targetRetireAge}>
        </div>
    </div>

</section>


<section class="py-3 d-flex flex-column align-items-center">

    <div class="d-flex flex-row justify-content-start align-items-center my-2">
        <span style="font-size: 27px; color: #ff2968; padding-right: 10px">
            <i class="fa fa-wallet"></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay In</label>
    </div>

    <input bind:value={monthlyPayIn} type="range" class="custom-range" id="monthlyPayInRange" 
        min="0" max="1000">

    <h2 class="py-4 "><em> ----- After {yearsTillRetire} years ----- </em></h2>

    <div class="d-flex flex-row justify-content-start align-items-center my-2">
        <span style="font-size: 27px; color: #ff2968; padding-right: 10px">
        <i class="fa fa-money-bill-alt"></i>
        </span>
        <label for="monthlyPayInRange">Monthly Pay Out</label>
    </div>

    <input bind:value={monthlyPayOut} type="range" class="custom-range" id="monthlyPayInRange" 
        min="0" max="100000">

</section>


<button on:click="{() => eth.joinDAO()}">Create Your Plan</button>