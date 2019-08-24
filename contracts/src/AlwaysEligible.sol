pragma solidity 0.5.11;

import "./Interfaces/EligibilityOracle.sol";

contract AlwaysEligible is EligibilityOracle {

    function isEligible(address who) external returns (bool) {
        return true;
    }
}