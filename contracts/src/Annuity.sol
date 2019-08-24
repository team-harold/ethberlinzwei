pragma solidity >=0.4.22 <0.6.0;

 /// a fair annuity is:
/// (1) EVPin = EVPout
/// (2) payInYearly * PVin = payOutYearly * PVout
/// (3) payOutYearly = payInYearly * PVin/ PVout
/// approximating the monthly payout (TODO: make it monthly discounting for fairer valuation)
/// (4) payOutMonthly = payOutYearly/12 = payInYearly * PVin / (12 * PVout) = payInMonthly * PVin/PVout
/// In the same way:
/// (3) payInYearly = payOutYearly * PVout/ PVin
/// (5) payInMonthly = payOutYearly/12 = payOutYearly * PVout / (12 * PVin) = payOutMonthly * PVout/PVin

contract Annuity {
 
 uint256 constant public PRECISION = 10^18;
 uint256 constant public interestRate = 5*10^16;

 uint256[] lifeTable;
 
constructor (uint256[] memory _lifeTable) public{
    lifeTable = _lifeTable;
}

function payOutPerMonth(uint256 _retirementAge, uint256 _currentAge, uint256 _interestRate, uint256 _payInPerMonth) public view returns (uint256 result){
  
  uint256 EVP_Out_x = calcPresentValueImmediateAnnuity(_retirementAge, _interestRate, lifeTable.length);
  uint256 EVP_Out = calcPresentV(_retirementAge - _currentAge,  _interestRate) * EVP_Out_x;
  uint256 EVP_In = calcPresentValueImmediateAnnuity(_currentAge, _interestRate, _retirementAge);
  result = _payInPerMonth *  EVP_In / EVP_Out;

}

function payInPerMonth(uint256 _retirementAge, uint256 _currentAge, uint256 _interestRate, uint256 _payOutPerMonth) public view returns (uint256 result){
  uint256 EVP_Out_x = calcPresentValueImmediateAnnuity(_retirementAge, _interestRate, lifeTable.length);
  uint256 EVP_Out = calcPresentV(_retirementAge - _currentAge, _interestRate) * EVP_Out_x;
  uint256 EVP_In = calcPresentValueImmediateAnnuity(_currentAge, _interestRate, _retirementAge);
  result = _payOutPerMonth *  EVP_Out / EVP_In;
}

function calcPresentValueImmediateAnnuity(uint256 x, uint256 i, uint256 n)  public view returns (uint256 ax) {
  
  for (uint256 t = 1; x+t < n; t++){
    uint256 vt = calcPresentV(t, i);
  
    // why x-1 is not clear, but it fits the R package lifecontingencies
    //uint256 _tpx = tpx(x-1, t);
    // aggregating everything to not store in uint and hence save precision.
    ax = ax + (vt*lifeTable[x-1+t]/(lifeTable[x-1] * PRECISION));
  }
}

function tpx(uint256 x, uint256 t)  internal view returns (uint256 result){
 result = lifeTable[x+t]/lifeTable[x];
}


/// Present value of a single payment in n years
function  calcPresentV(uint256 n, uint256 i) public pure returns (uint256 result){
  result = 1/(1+i)^n;
  
}

    
}