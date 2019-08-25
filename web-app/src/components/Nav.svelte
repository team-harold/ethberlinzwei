<script>
    export let segment;
</script>

<style>
    nav {
        border-bottom: 1px solid #ededed;
        font-weight: 300;
        padding: 0 1em;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    /* clearfix */
    ul::after {
        content: '';
        display: block;
        clear: both;
    }

    li {
        display: block;
        float: left;
    }

    .selected {
        position: relative;
        display: inline-block;
        
    }

    .selected::after {
        position: absolute;
        content: '';
        width: calc(100% - 1em);
        height: 2px;
        background-color: #ededed;
        display: block;
        bottom: -1px;
    }

    a {
        text-decoration: none;
        padding: 0.5em 0.25em;
        display: block;
    }
</style>

<nav>
    <ul>
        <li><a class='{segment === undefined ? "selected" : ""}' href='.'>HOME</a></li>
        <li><a class='{segment === "create" ? "selected" : ""}' href='create'>CREATE</a></li>
        <!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
                 the blog data when we hover over the link or tap it on a touchscreen -->
        <!-- <li><a rel=prefetch class='{segment === "blog" ? "selected" : ""}' href='blog'>blog</a></li> -->
    </ul>
</nav>