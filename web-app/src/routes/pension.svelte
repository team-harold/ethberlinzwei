<script>
    // Stores
    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';
    import transactions from '../stores/transactions';

    // Components
    import Create from '../components/create.svelte';
    import Pay from '../components/pay.svelte';
    import Dead from '../components/dead.svelte';
    import Pending from '../components/pending.svelte';
    import Modal from '../components/Modal.svelte';

</script>

{#if $wallet.status !== 'Ready'}
    <Pending/> <!-- TODO use WalletWrapper-->
{:else}
    {#if $userPensionData.status !== 'Loaded'}
    <Pending message="Getting your account info!"/>
    {:else}
        {#if !$userPensionData.joined}
            <Create />
        {:else}
            {#if $userPensionData.stage == "paying"}
                <Pay status={"paying"} />
            {:else if $userPensionData.stage == "retired"}
                <Pay status={"retired"} />
            {:else if $userPensionData.stage == "dead"}
                <Dead/>
            {/if}
        {/if}
    {/if}
{/if}

{#if $transactions.length > 0}
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