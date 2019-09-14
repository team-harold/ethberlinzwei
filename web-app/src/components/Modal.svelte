<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>


<div class='modal-background' on:click='{() => dispatch("close")}'>
    <div >
        <slot name='header'></slot>
        <hr>
        <slot></slot>
        <hr>
    </div>  
</div>
