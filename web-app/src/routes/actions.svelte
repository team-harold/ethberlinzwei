<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Create from '../components/create.svelte';
    import Pay from '../components/pay.svelte';
    import Dead from '../components/dead.svelte';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';

    async function fetchPendingTransactions() {
        let s = await eth.isJoined()
        return s.status
        // return 'paying'
        // return 'retired'
        // return 'dead'
    }
    let userStatus = ''

    onMount( async() => {
        userStatus = await fetchPendingTransactions()
    })

    let x = 1
</script>


{#if userStatus == 'new'}
	<Create/>
{:else if userStatus == "paying"}
	<Pay status={"paying"}/>
{:else if userStatus == "retired"}
	<Pay status={"retired"}/>
{:else}
	<Dead></Dead>
{/if}

