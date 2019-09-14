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

    $: retirementTime = $userPensionData.retirementTime;
    $: timestamp = BigNumber.from($everySecond).add($userPensionData.debug_timeDelta);
    $: deadline = 
       $userPensionData.contribution
        .div($userPensionData.payInPerMonth)
        .add(bn(1)) // beforePenalty
        .mul(bn(2629746)) // seconds in a month
        .add($userPensionData.startTime);

    $: penalty = 1; // TODO
    $: catchup = $userPensionData.payInPerMonth.add($userPensionData.payInPerMonth.mul(timestamp.sub(deadline)).div(bn(2629746)));
    
</script>


<section >

    <div >
        <span >
            <i ></i>
        </span>
        {#if deadline.gt(timestamp)}
            <h5>You next monthly payment is <span >{$userPensionData.payInPerMonth}</span> DAI </h5>
        {:else}
            <h5>You are {timestamp.sub(deadline).toNumber()}s late. You have to pay <span >{catchup}</span> DAI to catch up</h5>
        {/if}
    </div>

    <div >
        <span >
            <i ></i>
        </span>
        {#if deadline.gt(timestamp)}
        <h5>Your Deadline is <span >{format(deadline)}</span></h5>
        {:else}
        <h5>Your penalty is <span >{penalty}</span></h5>
        {/if}
    </div>

    <div id="payin-btn" >
        <button class="button-primary" on:click="{() => wallet.tx({value: catchup}, 'Pension', 'payIn')}"> Make Payment </button>
    </div>

</section>

<footer>
    <div >
        <h1>💰</h1>
        <h5> You have saved a total of <span >{$userPensionData.contribution}</span> DAI</h5>
        {#if timestamp.gt(retirementTime)}
        <h5>You are retired but you just need to pay the remaining balance</h5> <!-- TODO calculate -->
        {:else}
        <h5>Retiring on... <span >{format($userPensionData.retirementTime)}</span></h5>
        {/if}
    </div>
</footer>
