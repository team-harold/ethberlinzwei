<script>
    import wallet from '../stores/wallet';
    import eth from '../eth';
    import math from '../math/annuity';
    let monthlyPayIn = '0';
    let monthlyPayOut = '0';
    let currentAge = '18';
    let targetrRetireAge = '60'
</script>

<style>
#account {
    background: url(account.png) no-repeat left;
    background-size: 15px 15px;
    padding-left: 21px;
}

.harold-form {
    width: 50px
}
</style>


<h1> Explore your pension plan </h1>

<h4 id='account'>{($wallet.address && $wallet.status == 'Ready') ? $wallet.address : 'Web3 account not available'}</h4>

<h3> Some details about you: </h3>

<form>
  <div class="form-group row">
    <label for="form-age" class="col-sm-2 col-form-label">Your Age:</label>
    <div class="col-sm-10">
      <input type="text" class="harold-form" id="form-age" bind:value={currentAge}>
    </div>
  </div>
</form>

<label for="monthlyPayInRange">Monthly Pay In Range</label>
<input bind:value={monthlyPayIn} type="range" class="custom-range" id="monthlyPayInRange" 
    min="0" 
    max="1000">

<p>{monthlyPayIn}</p>

<button on:click="{() => eth.createAndMint(ipfsURI)}">Mint</button>