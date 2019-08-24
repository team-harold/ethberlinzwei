<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';
    export let status;
    let paymentDue = 999
    let amountPaid = 999
    let timeRetire = 999
    let timeDue = 999
</script>

<style>

h5 {
    color: #f7f7fa;
    font-size: 18px;
    margin: 0
}

#payin-btn {
    border-bottom: 1px solid #f2f2fa;
}

</style>

<header>
    <img alt="Transit" class="logo-img" src="logo_invert.png">
</header>

<section class="d-flex flex-column action-section">

    <div class="d-flex flex-column align-items-center my-3">
        <h1>😵</h1>
        <h4>Looks like you might not be alive anymore</h4>
    </div>

</section>

<footer>

</footer>

