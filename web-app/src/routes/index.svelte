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

<style>
    header {
        padding-bottom: 2rem;
        border-bottom: 1px solid #f2f2fa;
    }

    button {
        background: transparent;
        border: #00e8d5 1px solid;
        color: #00e8d5;
    }

    .index-section {
        padding: 2rem
    }
</style>

<header class="d-flex flex-column align-items-center">
    <img class="logo-img" alt="Transit" lass="logo-img" src="logo_invert.png">
    <button on:click="{ () => goto('pension') }"><a style="display: none;" href="pension">_</a>
        {#if loading}
        <i class="fas fa-spinner fa-spin"></i>
        {:else if join}
        Join Transit
        {:else}
        Manage Pension
        {/if}
    </button>
</header>

<section class="container-fluid index-section" style="text-align: center">

    <h1>What is Transit?</h1>
    <div class="row">

        <div class="col-sm">
            <span style="font-size: 47px; color: #00e8d5; padding-right: 10px">
                <i class="fas fa-users"></i>
            </span>
            <h4 class="h5"> Transit is a cooperatively owned Pension Plan based on the Ethereum Network</h4>
        </div>
        <div class="col-sm">
            <span style="font-size: 47px; color: #00e8d5; padding-right: 10px">
                <i class="fas fa-dharmachakra"></i>
            </span>
            <h4 class="h5">No stockholders. No corporations. Run entirely by those who invest in it</h4>
        </div>
        <div class="col-sm">
            <span style="font-size: 47px; color: #00e8d5; padding-right: 10px">
                <i class="far fa-hand-point-down"></i>
            </span>
            <h4 class="h5">YOU decide on your future financial security.</h4>
        </div>
    </div>

</section>

<section class="index-section" style="background: #616161">

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
