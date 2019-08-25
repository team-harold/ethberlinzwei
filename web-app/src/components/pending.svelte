<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';
    export let message;
</script>

<header>
    <img alt="Transit" class="logo-img" src="logo_invert.png">
</header>



<section class="d-flex flex-column action-section">
{#if $wallet.status == 'Locked'}
<div style="text-align:center">
    <button on:click="{wallet.unlock}"> Connect your wallet</button>
</div>
{:else if $wallet.status == 'Unlocking'}
<div style="text-align:center">
    <h3> Please accept the connection request </h3>
</div>
{:else if $wallet.status == 'WrongChain'}
<div style="text-align:center">
    <h3> Please change your network </h3>
</div>

{:else if $wallet.status == 'NoWallet'}

<div style="text-align:center">
    <h3> You need a wallet darling! </h3>
</div>

{:else if $wallet.status == 'Ready'}

        <h3>🤹‍♂️ {message}</h3>
        <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                aria-valuenow="100" 
                aria-valuemin="0" 
                aria-valuemax="100" 
                style="width: 100%; background-color:  #ff2968">
            </div>
        </div>

{/if}
</section>

<footer>

</footer>

