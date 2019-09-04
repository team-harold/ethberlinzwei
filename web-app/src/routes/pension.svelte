<script>
    // Stores
    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';
    import transactions from '../stores/transactions';
    import { everySecond } from '../stores/time';

    // Components
    import Create from '../components/create.svelte';
    import Pay from '../components/pay.svelte';
    import Dead from '../components/dead.svelte';
    import Pending from '../components/pending.svelte';
    import Modal from '../components/Modal.svelte';

    $: timestampBN = window.ethers.utils.bigNumberify($everySecond ? $everySecond : 0);
    $: payingIn = $userPensionData.retirementTime && $userPensionData.retirementTime.gt(timestampBN);
    $: retired = $userPensionData.retirementTime && $userPensionData.retirementTime.lte(timestampBN);

    // $: {
    //     console.log($userPensionData.retirementTime ? $userPensionData.retirementTime.toString(10) : 0);
    //     console.log(timestampBN.toString(10));
    // }

</script>

{#if $wallet.status !== 'Ready'}
    <Pending/> <!-- TODO use WalletWrapper-->
{:else}
    {#if $userPensionData.status !== 'Loaded'}
    <Pending message="Getting your account info!"/>
    {:else}
        {#if $userPensionData.joiningAge == 0}
            <Create />
        {:else}
            {#if $userPensionData.retirementTime == 0 } <!-- TODO use eligibility oracle -->
                <Dead/> <!-- TODO ineligible not dead-->
            {:else if payingIn}
                <Pay status={"paying"} />
            {:else if retired}
                <Pay status={"retired"} />
            {/if}
        {/if}
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
{/if}