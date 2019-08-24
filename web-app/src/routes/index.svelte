<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';

    let ipfsURI;
</script>

<style>
    h1 {
        color: purple;
    }
</style>

<h1>Hello{$wallet.address ? ' ' + $wallet.address : ''}!</h1>

<p> {$wallet.status} </p>
<p> ddsdss </p>

<input bind:value={ipfsURI} />

<button on:click="{() => eth.createAndMint(ipfsURI)}">Mint</button>