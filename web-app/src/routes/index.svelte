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

<a style="display:none" href="actions" />
<header class="d-flex flex-column align-items-center">
    <img class="logo-img" alt="Transit" lass="logo-img" src="logo_invert.png">
    <button on:click="{ () => {window.location.href=" actions"}}">JOIN Transit</button>
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

<!-- <section class="index-section">
    <h1>How does this work?</h1>
    <h3>1) Set you Pension Plan</h3>
    <h3>2) Pay a monthly sum (or more!) in DAI</h3>
    <h3>3) Participate via DAO on essential governance questions.</h3>
    <h3>4) After your established retirement age, you’ll receive monthly payments.</h3>
</section> -->


<!-- <div id="mc_embed_signup">
<form action="https://gmail.us3.list-manage.com/subscribe/post?u=fc6c50d83d805226f6635b795&amp;id=2bef0efc7b" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
    <div id="mc_embed_signup_scroll">
    <label for="mce-EMAIL">Subscribe to our Simulation starting in November</label>
    <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>
    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_fc6c50d83d805226f6635b795_2bef0efc7b" tabindex="-1" value=""></div>
    <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
    </div>
</form>
</div> -->