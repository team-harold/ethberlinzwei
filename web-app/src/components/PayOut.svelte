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


<section >

    <div >
        <h1>🥳</h1>
        <h5> You can withdraw <span >{$userPensionData.payOutPerMonth}</span> DAI</h5>
    </div>

    <div id="payin-btn" >
        <button on:click="{() => wallet.tx('Pension', 'claimPayOut')}"> Withdraw</button>
    </div>

</section>
