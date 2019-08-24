<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Create from '../components/create.svelte';
    import Pay from '../components/pay.svelte';
    import Dead from '../components/dead.svelte';
    import Pending from '../components/pending.svelte';
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';

    let userStatus = ''

    $: if($wallet.address) {
        fetchPendingTransactions()
    }

    async function fetchPendingTransactions() {
        console.log("getting userStatus: ", $wallet.address)
        userStatus = await eth.isJoined($wallet.address)
        console.log("userStatus: ", userStatus)
    }


    // onMount( async() => {
    //     setInterval(async () => {
    //         try {
    //             await fetchPendingTransactions()
    //         } catch (e) {
    //             console.log(e)
    //         }
    //     }, 1000);
    // })

</script>


{#if userStatus == 'new'}
	<Create/>
{:else if userStatus == "pending"}
	<Pending message={"mined transaction..."}/>
{:else if userStatus == "paying"}
	<Pay status={"paying"}/>
{:else if userStatus == "retired"}
	<Pay status={"retired"}/>
{:else}
	<Dead/>
{/if}

