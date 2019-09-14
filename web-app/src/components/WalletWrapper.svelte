<script>
        import wallet from '../stores/wallet';
</script>
       
    
{#if $wallet.status == 'Loading'}
    <div >
        <h3> Please wait... </h3>
    </div>
{:else if $wallet.status == 'Locked'}
    <div >
        <button on:click="{wallet.unlock}"> Connect your wallet</button>
    </div>
{:else if $wallet.status == 'Unlocking'}
    <div >
        <h3> Please accept the connection request </h3>
    </div>
{:else if $wallet.status == 'WrongChain'}
    <div >
        <h3> Please change your network </h3>
        {#if $wallet.requireManualChainReload }
            <h5 >You might need to reload the page after switching to the new chain</h5>
            <button on:click="{() => wallet.reloadPage()}">Reload</button>
        {/if}
    </div>
    
{:else if $wallet.status == 'NoWallet'}
    
    <div >
        <h3> You need a wallet darling! </h3>
    </div>
    
{:else if $wallet.status == 'Opera_FailedChainId'}
    
    <div >
        <h3 > You are using Opera </h3>
        <h5 >You need to set up your wallet. if a popup did not come up you'll need to go into Opera setting to set it up.</h5>
        <button on:click="{() => wallet.retry()}">Retry</button>
    </div>
    
{:else if $wallet.status == 'Opera_Locked'}
    
    <div >
        <h3 > You are using Opera </h3>
        <h5 > You need to authorize access to your wallet. </h5>
        <button on:click="{() => wallet.retry()}">Request Access</button>
    </div>
    
{:else if $wallet.status == 'Error'}
    
    <div >
        <h3 > There were an Error </h3>
        <h5 >{$wallet.error.message}</h5>
        <button on:click="{() => wallet.retry()}">Retry</button>
    </div>
    
{:else if $wallet.status == 'Ready'}
    {#if $wallet.requestingTx}
    <div >
        <h3> Please accept the transaction request </h3>
    </div>
    {:else}
    <slot></slot>    
    {/if}
{/if}
