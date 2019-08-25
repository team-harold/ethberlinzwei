<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Create from '../components/create.svelte';
    import Pay from '../components/pay.svelte';
    import Dead from '../components/dead.svelte';
    import Pending from '../components/pending.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';

    let userStatus = {joined : 'pending', status: 'pending'}
    let pendingMessage = 'Getting your account info!'

    $: if($wallet.address) {
        checkStatus()
    }

    async function checkStatus() { //
        let l = await checkLocalStorage()
        if (!l) {
            checkUserContractStatus()
        }
    }

    async function checkLocalStorage () {
        console.log("getting localstorages: ", $wallet.address)
        let pendingTxString =  localStorage.getItem($wallet.address)
        console.log("pendingTxString: ", pendingTxString)
        if (pendingTxString) {
            let r = await eth.getTransactionReceipt(pendingTxString);
            if (r){
                if ( r.status == 1) {
                    localStorage.removeItem($wallet.address)
                    return false
                }
            } else {
                console.log('status is pending again')
                userStatus = {joined : 'pending', status: 'pending'}
            }
        }
        return false
    }

    async function checkUserContractStatus () {
        console.log("getting userStatus from contract: ", $wallet.address)
        let status = await eth.isJoined($wallet.address)
        console.log('status: ', status)
        userStatus = {
            joined: status.joined,
            status: status.status == 0 ? 'retired' : status.status == 1 ? 'paying' : 'dead'
        }
        console.log('userStatus: ', userStatus)
    }

    function handleTxPending (event){
        pendingMessage = event.detail.msg;
        checkStatus()// setTime out? how to stop it
    }



</script>


{#if !userStatus.joined && userStatus.status == 'retired'}
	<Create on:txPending={handleTxPending}/> 
{:else if userStatus.joined == 'pending' && userStatus.status == 'pending'}
	<Pending message={pendingMessage}/>
{:else if userStatus.joined && userStatus.status == "paying"}
	<Pay status={"paying"} on:txPending={handleTxPending}/>
{:else if userStatus.joined && userStatus.status == "retired"}
	<Pay status={"retired"} on:txPending={handleTxPending}/>
{:else if userStatus.joined && userStatus.status == "dead"}
	<Dead/>
{/if}

<!-- BELSY TODO -->
<!-- emit event from create and pay in / out -->
