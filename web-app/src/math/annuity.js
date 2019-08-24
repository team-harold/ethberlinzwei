/// a fair annuity is:
/// (1) EVPin = EVPout
/// (2) payInYearly * PVin = payOutYearly * PVout
/// (3) payOutYearly = payInYearly * PVin/ PVout
/// approximating the monthly payout (TODO: make it monthly discounting for fairer valuation)
/// (4) payOutMonthly = payOutYearly/12 = payInYearly * PVin / (12 * PVout) = payInMonthly * PVin/PVout
/// In the same way:
/// (3) payInYearly = payOutYearly * PVout/ PVin
/// (5) payInMonthly = payOutYearly/12 = payOutYearly * PVout / (12 * PVin) = payOutMonthly * PVout/PVin

var i = 0.05

function payOutPerMonth(_retirementAge, _currentAge, _payInPerMonth, lifeTable){
  var payInMonthly = Number(_payInPerMonth);
  Utilities.sleep(100)
  var EVP_Out_x = PresentValueImmediateAnnuity(_retirementAge, i, lifeTable.length, lifeTable)
  var EVP_Out = PresentV(_retirementAge - _currentAge,  i) * EVP_Out_x
  var EVP_In = PresentValueImmediateAnnuity(_currentAge, i, _retirementAge, lifeTable)
  var result = payInMonthly *  EVP_In / EVP_Out;
  return result;
}

function payInPerMonth(_retirementAge, _currentAge, _payOutPerMonth, lifeTable){
  Utilities.sleep(100)
  var payOutMonthly = Number(_payOutPerMonth);
  var EVP_Out_x = PresentValueImmediateAnnuity(_retirementAge, i, lifeTable.length, lifeTable)
  var EVP_Out = PresentV(_retirementAge - _currentAge, i) * EVP_Out_x
  var EVP_In = PresentValueImmediateAnnuity(_currentAge, i, _retirementAge, lifeTable)
  var result = payOutMonthly *  EVP_Out / EVP_In;
  return result;
}

function PresentValueImmediateAnnuity(x, i, n, lifeTable) {
  
  // JS is very ambiguos
  x = Number(x);
  i = Number(i);
  n = Number(n);
  var ax = 0
  
  for (var t = 1; x+t < n; t++){
    // JS can't handle x^y correctly!
    vt = Math.pow( (1/(1+i)), t)
  
    // why x-1 is not clear, but it fits the R package lifecontingencies
    _tpx = tpx(x-1, t, lifeTable)
    
    ax = ax + (vt*_tpx)
    
    Logger.log(t + ": age "+ (x+t) + ": " +
               " + vt " + vt +
               " * tpx " + _tpx +
               " = PV " + ax);
  }
   return ax
}

function tpx(x, t, lifeTable){
 result = lifeTable[x+t]/lifeTable[x]
 return result
}


/// Present value of a single payment in n years
function  PresentV(n, i){
  result = Math.pow( (1/(1+i)), n) // JS can't handle x^y correctly!
  return result;
}


/// standardized payments in n years
function  PresentVSummOfPayments(n, i){
  
  var result=0;
  for (var t = 0; t < n; t++){
    vt = Math.pow( (1/(1+i)), t+1) // JS can't handle x^y correctly!
    result = result + vt
  }
  return result;
}

