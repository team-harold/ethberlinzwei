<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import {onMount, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
    export let status;

    const dispatch = createEventDispatcher();

    let payInData = []
    onMount( async() => {
        payInData = await eth.getPayIn($wallet.address)
        console.log("pay in data: ", payInData)

    })
    $:paymentDue = payInData.amountDue ? payInData.amountDue.toString(10) : ''
    $:amountPaid = payInData.amountPaid ? payInData.amountPaid.toString(10) : ''
    $:timeRetire = payInData.timeRetire ? payInData.timeRetire.toString(10) : ''
    $:timeDue = payInData.nextPaymentDueOn ? payInData.nextPaymentDueOn.toString() : ''

</script>

<style>

h5 {
    color: #f7f7fa;
    font-size: 18px;
    margin: 0
}

#payin-btn {
    border-bottom: 1px solid #f2f2fa;
}

</style>

<header>
    <img alt="Transit" class="logo-img" src="logo_invert.png">
</header>

{#if status == 'paying'}
<section class="d-flex flex-column action-section">

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-money-bill"></i>
        </span>
        <h5>You next monthly payment is <span style="color: #ff2968">{paymentDue}</span></h5>
    </div>

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-clock"></i>
        </span>
        <h5>You have <span style="color: #ff2968">{timeDue}</span> before the deadline</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => {}}"> Make Payment </button>
    </div>

</section>

<footer>
    <div class="d-flex flex-column align-items-center my-3">
        <h1>💰</h1>
        <h5> You have saved a total of <span style="color: #ff2968">{amountPaid}</span> DAI</h5>
        <h5>Retiring on... <span style="color: #ff2968">{timeRetire}</span></h5>
    </div>
</footer>

{:else}
<section class="d-flex flex-column action-section">

    <div class="d-flex flex-column align-items-center my-3">
        <h1>🥳</h1>
        <h5> You can withdraw <span style="color: #ff2968">{amountPaid}</span> DAI</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => {}}"> Withdraw</button>
    </div>

</section>

{/if}
