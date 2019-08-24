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
    
    uint256[] _lifeTable;
    uint256[] _interestBasedTable;
     
    constructor (uint256[] memory lifeTable, uint256[] memory presentValueCompoundInterestNominators) public{
        _lifeTable = lifeTable;
        _interestBasedTable = presentValueCompoundInterestNominators;
    }
    
    function payOutPerMonth(uint256 _retirementAge, uint256 _currentAge, uint256 _payInPerMonth) public view returns (uint256 result){
      
      uint256 EVP_Out_x = calcPresentValueImmediateAnnuity(_retirementAge, _lifeTable.length);// div Precision
      uint256 EVP_Out = getPresentVNominator(_retirementAge - _currentAge) * EVP_Out_x; // div Precision
      uint256 EVP_In = calcPresentValueImmediateAnnuity(_currentAge, _retirementAge); // div PRECISION
      result = _payInPerMonth *  EVP_In / (EVP_Out * PRECISION); // 2 Precision divs are canceled out and 1 remains
    }
    
    function calcPresentValueImmediateAnnuity(uint256 x,  uint256 n)  public view returns (uint256 ax) {
      
      for (uint256 t = 1; x+t < n; t++){
        uint256 vt = getPresentVNominator(t);
      
        // why x-1 is not clear, but it fits the R package lifecontingencies
        // aggregating everything to not store in uint and hence save precision.
        ax = ax + (vt*_lifeTable[x-1+t]/(_lifeTable[x-1]));
      }
    }
    
    /// Present value of a single payment in n years
    function  getPresentVNominator(uint256 n) public view returns (uint256 result){
      result = _interestBasedTable[n];
    }

    
}