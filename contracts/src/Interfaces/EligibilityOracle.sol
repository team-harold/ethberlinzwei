pragma solidity ^0.5.0;

interface EligibilityOracle {
    function isEligible(address who, uint16 currentAge) external returns (bool);
}
