<script>
    import { BigNumber } from 'ethers';

    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';
    import { everySecond } from '../stores/time';

    function getDateString(time) {
        let d = new Date(time)
        return d.toDateString()
    }

    function format(d) {
        return d ? getDateString(d.toNumber() * 1000) : ''
    }

    function bn(n) {
        return BigNumber.from(n);
    }

    $: timestampBN = bn($everySecond +  $userPensionData.debug_timeDelta);
    $: retirementTime = $userPensionData.retirementTime ? $userPensionData.retirementTime : bn(0);
    $: payingIn = retirementTime.gt(timestampBN);
    $: retired = retirementTime.lte(timestampBN);

    $: console.log({retired, payingIn, retirementTime});

    $: deadline = 
        $userPensionData.contribution ? 
            $userPensionData.contribution
            .div($userPensionData.payInPerMonth)
            .add(bn(1))
            .mul(bn(2629746))
            .add($userPensionData.startTime) :
        0;
    
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

{#if payingIn}
<section class="d-flex flex-column action-section">

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-money-bill"></i>
        </span>
        <h5>You next monthly payment is <span style="color: #ff2968">{$userPensionData.payInPerMonth}</span> DAI </h5>
    </div>

    <div class="d-flex flex-row align-items-center my-1">
        <span style="font-size: 18px; color: #00e8d5; padding-right: 10px">
            <i class="fa fa-clock"></i>
        </span>
        <h5>Your Deadline is <span style="color: #ff2968">{format(deadline)}</span></h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => wallet.tx({value: $userPensionData.payInPerMonth}, 'Pension', 'payIn')}"> Make Payment </button>
    </div>

</section>

<footer>
    <div class="d-flex flex-column align-items-center my-3">
        <h1>💰</h1>
        <h5> You have saved a total of <span style="color: #ff2968">{$userPensionData.contribution}</span> DAI</h5>
        <h5>Retiring on... <span style="color: #ff2968">{format($userPensionData.retirementTime)}</span></h5>
    </div>
</footer>

{:else}
<section class="d-flex flex-column action-section">

    <div class="d-flex flex-column align-items-center my-3">
        <h1>🥳</h1>
        <h5> You can withdraw <span style="color: #ff2968">{$userPensionData.payOutPerMonth}</span> DAI</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => wallet.tx('Pension', 'claimPayOut')}"> Withdraw</button>
    </div>

</section>

{/if}