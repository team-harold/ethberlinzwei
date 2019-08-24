<script>
    import init from '../init';
    init();

    import Nav from '../components/Nav.svelte';
    export let segment;
</script>

<Nav {segment} />

<main>
    <slot></slot>
</main>