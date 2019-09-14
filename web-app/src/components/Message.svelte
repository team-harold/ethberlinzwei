<script>
    import wallet from '../stores/wallet';

    export let message = "Please wait...";
</script>

<section >
    <h3>🤹‍♂️ {message}</h3>
    <div >
        <div  
            role="progressbar" 
            aria-valuenow="100" 
            aria-valuemin="0" 
            aria-valuemax="100">
        </div>
    </div>
</section>

<footer>

</footer>
