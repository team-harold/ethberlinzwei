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
    $:paymentDue = payInData.amountDue ? payInData.amountDue/1e18: ''
    $:amountPaid = payInData.amountPaid ? payInData.amountPaid : ''
    $:timeRetire = payInData.timeRetire ? getDateString(payInData.timeRetire.toNumber()*1000) : ''
    $:timeDue = payInData.nextPaymentDueOn ? getDateString(payInData.nextPaymentDueOn.toNumber()*1000) : ''
    async function payIn() {
        try {
            console.log("paymentDue: ", paymentDue)
            let txObj = await eth.payIn(paymentDue.toString()   )
            localStorage.setItem($wallet.address, txObj.hash)
            dispatch('txPending', {msg: 'Confirming your new payment! 😊'})
        } catch (e) { console.log(e) }
    }

    async function withdraw() {
        try {
            let txObj = await eth.withdraw()
            localStorage.setItem($wallet.address, txObj.hash)
            dispatch('txPending', {msg: 'Sending you some 💵!'})
        } catch (e) { console.log(e) }
    }

    function getDateString(time) {
        let d = new Date(time)
        return d.toDateString()
    }

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
        <h5>You next monthly payment is <span style="color: #ff2968">{paymentDue} DAI</span></h5>
    </div>

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-clock"></i>
        </span>
        <h5>You have <span style="color: #ff2968">{timeDue}</span> before the deadline</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{payIn}"> Make Payment </button>
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
        <button on:click="{withdraw}"> Withdraw</button>
    </div>

</section>

{/if}
