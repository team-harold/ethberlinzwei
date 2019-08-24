<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import annuity from '../math/annuity';
    import Modal from './Modal.svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';
    export let message;
</script>

<style>

h5 {
    color: #f7f7fa;
    font-size: 18px;
    margin: 0
}


</style>

<header>
    <img alt="Transit" class="logo-img" src="logo_invert.png">
</header>

<section class="d-flex flex-column action-section">

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

</section>

<footer>

</footer>

