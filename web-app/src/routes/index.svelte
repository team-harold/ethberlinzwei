<script>
    import { goto } from '@sapper/app';

    import wallet from '../stores/wallet';
    import userPensionData from '../stores/userPensionData';

    $: loading = $wallet.status === 'Loading' || $userPensionData.status === 'Loading';
    $: join = !loading && ($userPensionData.status !== 'Loaded' || $userPensionData.joiningAge === 0)

</script>
<svelte:head>
    <title>Transit Fund</title>
</svelte:head>


<header>
    <div class="flex justify-center">
        <img class="p-6 max-w-sm" alt="Transit" src="logo_invert.png">
    </div>
    <div class="py-6 flex justify-center">
        <a class="button p-1 w-48 border rounded-lg border-logo1 text-logo1" href="pension">
            {#if loading}
            <div class="lds-dual-ring p2"></div>
            {:else if join}
            JOIN Transit
            {:else}
            Manage Pension
            {/if}
        </a>
    </div>
</header>

<section>

    <div><h1>What is Transit?</h1></div>
    
    <div class="flex flex-wrap" >

        <div class="w-full sm:w-1/3">
            <span >
                <i ></i>
            </span>
            <h4 > Transit is a cooperatively owned Pension Plan based on the Ethereum Network</h4>
        </div>
        <div class="w-full md:w-1/3">
            <span >
                <i ></i>
            </span>
            <h4 >No stockholders. No corporations. Run entirely by those who invest in it</h4>
        </div>
        <div class="w-full md:w-1/3">
            <span >
                <i ></i>
            </span>
            <h4 >YOU decide on your future financial security.</h4>
        </div>
    </div>

</section>

<section >

    <h1>Why Transit</h1>
    <h2> Cost </h2>
    <p>As transit (compared to traditional provider) needs no infrastructure at all and just a few employees we can pass
        this cost advantage to our users.</p>

    <h2>Governance</h2>

    <p>With its integrated DAO transit offers a lot of governance tools: not only can certain decisions (investment
        strategy) be made by our members directly.</p>
    <p>Members can vote on the most important positions in the administration every 4 year.</p>


    <h2>Tokenization </h2>

    <p>You can tokenize your pension and give it to those who help you to make your retirement as comfortably as
        possible. Apart from a pure STO the transit-token can be given to those who care for you: your children, your
        elderly home or your retirement community in Florida. They will have an interest to treat you well.</p>

</section>
