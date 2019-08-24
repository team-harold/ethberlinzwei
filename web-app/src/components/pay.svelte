<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';
    export let status;
    let paymentDue = 999
    let amountPaid = 999
    let timeRetire = 999
    let timeDue = 999
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
