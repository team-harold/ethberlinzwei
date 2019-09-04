<script>
    import wallet from '../stores/wallet';
    import pensionData from '../stores/userPensionData';
    export let status;

    function getDateString(time) {
        let d = new Date(time)
        return d.toDateString()
    }

    function format(d) {
        return d ? getDateString(d.toNumber() * 1000) : ''
    }

    // $: paymentDue = payInData.amountDue ? payInData.amountDue : ''
    //     $: amountPaid = payInData.amountPaid ? payInData.amountPaid : ''
    //     $: timeRetire = payInData.timeRetire ? getDateString(payInData.timeRetire.toNumber() * 1000) : ''
    //     $: timeDue = payInData.nextPaymentDueOn ? getDateString(payInData.nextPaymentDueOn.toNumber() * 1000) : ''

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
        <h5>You next monthly payment is <span style="color: #ff2968">{$pensionData.paymentDue}</span> DAI </h5>
    </div>

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-clock"></i>
        </span>
        <h5>Next Deadline is <span style="color: #ff2968">{format($pensionData.nextPaymentDueOn)}</span></h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => wallet.tx({value: $pensionData.paymentDue}, 'Pension', 'payIn')}"> Make Payment </button>
    </div>

</section>

<footer>
    <div class="d-flex flex-column align-items-center my-3">
        <h1>💰</h1>
        <h5> You have saved a total of <span style="color: #ff2968">{$pensionData.amountPaid}</span> DAI</h5>
        <h5>Retiring on... <span style="color: #ff2968">{format($pensionData.timeRetire)}</span></h5>
    </div>
</footer>

{:else}
<section class="d-flex flex-column action-section">

    <div class="d-flex flex-column align-items-center my-3">
        <h1>🥳</h1>
        <h5> You can withdraw <span style="color: #ff2968">{$pensionData.amountPaid}</span> DAI</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => wallet.tx('WelfareFund', 'claimPayout')}"> Withdraw</button>
    </div>

</section>

{/if}