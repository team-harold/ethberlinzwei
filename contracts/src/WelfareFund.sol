pragma solidity 0.5.11;

import "./Interfaces/EligibilityOracle.sol";

contract WelfareFund {

    uint256 constant NUM_SECONDS_IN_A_YEAR = 31556952;
    uint256 constant NUM_SECONDS_IN_A_MONTH = NUM_SECONDS_IN_A_YEAR / 12; // 2629746;
    uint256 constant NUM_SECONDS_BEFORE_PENALTY = NUM_SECONDS_IN_A_MONTH + 1 * 24*60*60; // 1 days

    struct Person {
        uint16 joiningAge; // we assume nobody can live more than 65535 years
        uint120 payInPerSecond;
        uint120 payOutPerSecond;
        uint64 lastPaymnentTime;
        uint64 retirementTime;
        uint64 startTime;
        uint128 contribution;
        uint128 totalPaidOut;
    }

    mapping(address => Person) _persons;
    uint64[] _mortalityTable;
    EligibilityOracle _eligibilityOracle;

    constructor(uint64[] memory mortalityTable, EligibilityOracle eligibilityOracle) public {
        _mortalityTable = mortalityTable;
        _eligibilityOracle = eligibilityOracle;
    }

    bool _init;
    function init() external {
        require(!_init, "already initialised");
        _eligibilityOracle.associate();
        _init = true;
    }

    function _computeMonthlyPayOut(uint16 joiningAge, uint16 retirementAge, uint128 monthlyPayIn) internal returns(uint128) {
        return 1;
    }

    function join(uint16 joiningAge, uint16 retirementAge, uint128 monthlyPayIn) external payable {
        require(joiningAge > 0, "need to have lived at least one year");
        require(_persons[msg.sender].joiningAge == 0, "cannot register twice");
        uint256 monthlyPayOut = _computeMonthlyPayOut(joiningAge, retirementAge, monthlyPayIn);
        uint16 numYears = retirementAge - joiningAge;
        _persons[msg.sender].joiningAge = joiningAge;
        _persons[msg.sender].payOutPerSecond = uint120(monthlyPayOut * NUM_SECONDS_IN_A_MONTH);
        _persons[msg.sender].payInPerSecond = uint120(monthlyPayIn * NUM_SECONDS_IN_A_MONTH);
        _persons[msg.sender].retirementTime = uint64(block.timestamp + numYears * NUM_SECONDS_IN_A_YEAR);
        _persons[msg.sender].startTime = uint64(block.timestamp);
        _payIn();
        _eligibilityOracle.onJoined(msg.sender, joiningAge);
    }

    function payIn() external payable {
        _payIn();
    }

    function _payIn() internal {
        uint256 retirementTime = _persons[msg.sender].retirementTime;
        uint256 startTime = _persons[msg.sender].startTime;
        uint256 payInPerSecond = _persons[msg.sender].payInPerSecond;
        uint256 currentContribution = _persons[msg.sender].contribution;
        require(msg.value <= (retirementTime - startTime) * payInPerSecond - currentContribution, "over pay"); // TODO refund ?

        uint256 minTime = block.timestamp;
        if(minTime > retirementTime) {
            minTime = retirementTime;
        }
        uint256 expectedContribution = (minTime - _persons[msg.sender].startTime) * payInPerSecond;
        uint256 diff = expectedContribution - currentContribution;
        uint256 penalty = 0;
        if(diff / payInPerSecond > NUM_SECONDS_BEFORE_PENALTY) {
            penalty = ((diff / payInPerSecond) / NUM_SECONDS_BEFORE_PENALTY) * 1; // TODO
        }
        _persons[msg.sender].contribution = uint120(currentContribution + msg.value);
    }

    function claimPayOut() external {
        uint256 retirementTime = _persons[msg.sender].retirementTime;
        require(block.timestamp > retirementTime, "not retired yet");
        uint256 joiningAge = _persons[msg.sender].joiningAge;
        uint256 startTime = _persons[msg.sender].startTime;
        uint16 currentAge = uint16(joiningAge + (block.timestamp - startTime) / NUM_SECONDS_IN_A_YEAR); // TODO check overflow ?
        require(!_eligibilityOracle.isEligible(msg.sender, currentAge), "not eligible");
        uint256 totalPaidOut = _persons[msg.sender].totalPaidOut;
        uint128 payOutPerSecond = _persons[msg.sender].payOutPerSecond;
        uint256 toPay = (block.timestamp - retirementTime) * payOutPerSecond;
        uint120 diff = uint120(toPay - totalPaidOut);
        msg.sender.transfer(diff);
        _persons[msg.sender].totalPaidOut += diff;
    }
}