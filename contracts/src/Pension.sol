pragma solidity 0.5.11;

import "./Interfaces/EligibilityOracle.sol";
import "./Annuity.sol";

contract Pension is Annuity {

    uint256 constant NUM_SECONDS_IN_A_YEAR = 31556952;
    uint256 constant NUM_SECONDS_IN_A_MONTH = 2629746; //NUM_SECONDS_IN_A_YEAR / 12; // 2629746;
    uint256 constant NUM_SECONDS_BEFORE_PENALTY = NUM_SECONDS_IN_A_MONTH + 1 * 24*60*60; // 1 days

    struct Person {
        uint16 joiningAge; // we assume nobody can live more than 65535 years
        uint120 payInPerMonth;
        uint120 payOutPerMonth;
        uint64 retirementTime;
        uint64 startTime;
        uint128 contribution;
        uint128 totalPaidOut;
    }

    mapping(address => Person) _persons;
    EligibilityOracle _eligibilityOracle;

    constructor(
        uint256[] memory lifeTable,
        uint256[] memory interestBasedTable,
        EligibilityOracle eligibilityOracle
    ) public Annuity(lifeTable, interestBasedTable) {
        _eligibilityOracle = eligibilityOracle;
    }

    bool _init;
    function init() external {
        require(!_init, "already initialised");
        _eligibilityOracle.associate();
        _init = true;
    }

    event Joined(address who, uint120 payOutPerMonth, uint120 payInPerMonth, uint64 startTime, uint64 retirementTime);

    function join(uint16 joiningAge, uint16 retirementAge, uint120 monthlyPayIn) external payable {
        require(joiningAge > 0, "need to have lived at least one year");
        require(_persons[msg.sender].joiningAge == 0, "cannot register twice");
        uint120 payOutPerMonth = uint120(_payOutPerMonth(retirementAge, joiningAge, monthlyPayIn));
        uint16 numYears = retirementAge - joiningAge;
        uint64 retirementTime = uint64(_getTime() + numYears * NUM_SECONDS_IN_A_YEAR);
        uint64 startTime = uint64(_getTime());
        _persons[msg.sender].joiningAge = joiningAge;
        _persons[msg.sender].payOutPerMonth = payOutPerMonth;
        _persons[msg.sender].payInPerMonth = monthlyPayIn;
        _persons[msg.sender].retirementTime = retirementTime;
        _persons[msg.sender].startTime = startTime;
        emit Joined(msg.sender, payOutPerMonth, monthlyPayIn, startTime, retirementTime);
        _eligibilityOracle.onJoined(msg.sender, joiningAge);
        if(msg.value > 0) {
            _payIn();
        }
    }

    function payIn() external payable {
        _payIn();
    }

    function _payIn() internal {
        uint256 retirementTime = _persons[msg.sender].retirementTime;
        uint256 startTime = _persons[msg.sender].startTime;
        uint256 payInPerMonth = _persons[msg.sender].payInPerMonth;
        uint256 currentContribution = _persons[msg.sender].contribution;
        // TODO :  reenable : require(msg.value <= ((retirementTime - startTime) * payInPerMonth / NUM_SECONDS_IN_A_MONTH) - currentContribution, "over pay"); // TODO refund ?

        uint256 minTime = _getTime();
        if(minTime > retirementTime) {
            minTime = retirementTime;
        }
        uint256 expectedContribution = ((minTime - _persons[msg.sender].startTime) * payInPerMonth) / NUM_SECONDS_IN_A_MONTH;
        uint256 diff = expectedContribution - currentContribution;
        uint256 penalty = 0;
        if(diff / payInPerMonth > 2) {
            penalty = ((diff / payInPerMonth) / 2) * 1; // TODO
        }
        _persons[msg.sender].contribution = uint120(currentContribution + msg.value);
    }

    function claimPayOut() external {
        uint256 retirementTime = _persons[msg.sender].retirementTime;
        require(_getTime() > retirementTime, "not retired yet");

        uint256 startTime = _persons[msg.sender].startTime;
        uint256 currentContribution = _persons[msg.sender].contribution;
        require(currentContribution >= ((retirementTime - startTime) * _persons[msg.sender].payInPerMonth) / NUM_SECONDS_IN_A_MONTH, "did not pay all");

        uint256 joiningAge = _persons[msg.sender].joiningAge;
        
        uint16 currentAge = uint16(joiningAge + (_getTime() - startTime) / NUM_SECONDS_IN_A_YEAR); // TODO check overflow ?
        require(_eligibilityOracle.isEligible(msg.sender, currentAge), "not eligible");
        uint256 totalPaidOut = _persons[msg.sender].totalPaidOut;
        uint128 payOutPerMonth = _persons[msg.sender].payOutPerMonth;
        uint256 toPay = ((_getTime() - retirementTime) * payOutPerMonth) / NUM_SECONDS_IN_A_MONTH;
        uint120 diff = uint120(toPay - totalPaidOut);
        msg.sender.transfer(diff);
        _persons[msg.sender].totalPaidOut += diff;
    }

    function timeWhenPenalty(address who) external view returns(uint256) {
        uint256 startTime = _persons[who].startTime;
        if(startTime == 0) {
            return 0;
        }
        return startTime + (_persons[who].contribution / _persons[who].payInPerMonth) * NUM_SECONDS_IN_A_MONTH + 2; // TODO fix
    }

    function getPayIn(address who) external view returns (
        bool joined,
        uint256 nextPaymentDueOn,
        uint256 amountDue,
        uint256 amountPaid,
        uint256 timeRetire
    ){
        uint256 startTime = _persons[who].startTime;
        joined = startTime != 0;
        if(joined) {
            nextPaymentDueOn = startTime + (_persons[who].contribution / _persons[who].payInPerMonth) * NUM_SECONDS_IN_A_MONTH + 2; // TODO fix
        }
        amountDue = _persons[who].payInPerMonth;
        amountPaid = _persons[who].contribution;
        timeRetire = _persons[who].retirementTime;
    }

    function getPayOutPerMonth(address who) external view returns(uint256){
        return _persons[who].payOutPerMonth;
    }

    function getPayInPerMonth(address who) external view returns(uint256){
        return _persons[who].payInPerMonth;
    }

    enum Status {retired, paying, dead}
    function isJoined(address who) external view returns (
        bool joined,
        Status status
    ){
        uint16 currentAge = uint16(_persons[who].joiningAge +
            (_getTime() - _persons[who].startTime) / NUM_SECONDS_IN_A_YEAR); // TODO check overflow ?
        bool isDead = !_eligibilityOracle.isEligible(who, currentAge); // TODO eligibility, not death
        if (isDead) status = Status.dead;
        else {
            bool isRetired = _getTime() > _persons[who].retirementTime;
            if (isRetired) status = Status.retired;
            else status = Status.paying;
        }
        joined = _persons[who].joiningAge > 0;
    }


    int256 _timeDelta;
    function _getTime() internal view returns(uint256) {
        return uint256(int256(block.timestamp) + _timeDelta);
    }

    function getTime() external view returns(uint256) {
        return _getTime();
    }

    function debug_addTimeDelta(int256 delta) external {
        _timeDelta += delta;
        _eligibilityOracle.debug_addTimeDelta(delta);
    }
}