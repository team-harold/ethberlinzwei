<script>
    import { BigNumber } from 'ethers';

    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';
    
    function getDateString(time) {
        let d = new Date(time)
        return d.toDateString()
    }

    function format(d) {
        return d ? getDateString(d.toNumber() * 1000) : ''
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

<section class="d-flex flex-column action-section">

    <div class="d-flex flex-column align-items-center my-3">
        <h1>🥳</h1>
        <h5> You can withdraw <span style="color: #ff2968">{$userPensionData.payOutPerMonth}</span> DAI</h5>
    </div>

    <div id="payin-btn" class="d-flex flex-column align-items-center py-5">
        <button on:click="{() => wallet.tx('Pension', 'claimPayOut')}"> Withdraw</button>
    </div>

</section>
