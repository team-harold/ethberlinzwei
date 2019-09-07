<script>
    import { BigNumber } from 'ethers';

    // Stores
    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';
    import transactions from '../stores/transactions';
    import { everySecond } from '../stores/time';

    // Components
    import WalletWrapper from '../components/WalletWrapper'
    import Create from '../components/Create';
    import PayIn from '../components/PayIn';
    import PayOut from '../components/PayOut';
    import Dead from '../components/Dead';
    import Message from '../components/Message';
    import Modal from '../components/Modal';

    $: timestamp = BigNumber.from($everySecond).add($userPensionData.debug_timeDelta);
    $: retirementTime = $userPensionData.retirementTime;
    $: payingIn = retirementTime.gt(timestamp);
    $: retired = retirementTime.lte(timestamp);
    $: payingOut = retired && $userPensionData.contribution.gte(48) 
    $: dead = false; // TODO

</script>

<header>
    <a href="/"><img alt="Transit" class="logo-img" src="logo_invert.png"></a>
</header>
    

<WalletWrapper>
    {#if $userPensionData.status !== 'Loaded'}
        <Message message="Getting your account info!"/>
    {:else}
        {#if $userPensionData.joiningAge == 0}
            <Create />
        {:else}
            {#if dead } <!-- TODO use eligibility oracle -->
                <Dead/> <!-- TODO ineligible not dead-->
            {:else if payingOut}
                <PayOut/>
            {:else}
                <PayIn/>
            {/if}
        {/if}

        <!-- TRANSACTION CONFIRMATIONS -->
        {#if $transactions.status === 'Loading'}
            <Modal>
                <h4 slot="header">Checking Pending Transactions</h4>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar" 
                        aria-valuenow="100" 
                        aria-valuemin="0" 
                        aria-valuemax="100" 
                        style="width: 100%; background-color:  #ff2968"></div>
                </div>
            </Modal>
        {:else if $transactions.numUnConfirmed > 0}
            <Modal>
                <h4 slot="header">Transaction in Porgress</h4>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar" 
                        aria-valuenow="100" 
                        aria-valuemin="0" 
                        aria-valuemax="100" 
                        style="width: 100%; background-color:  #ff2968"></div>
                </div>
            </Modal>
        {/if}

    {/if}
</WalletWrapper>
