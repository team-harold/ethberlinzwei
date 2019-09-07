<script>
    import wallet from '../stores/wallet';

    export let message = "Please wait...";
</script>

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
