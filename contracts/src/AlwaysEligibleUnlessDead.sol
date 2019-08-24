pragma solidity 0.5.11;

import "./Interfaces/EligibilityOracle.sol";
import "./Interfaces/DeathOracle.sol";

contract AlwaysEligibleUnlessDead is EligibilityOracle {

    DeathOracle _deathOracle;
    constructor(DeathOracle deathOracle) public {
        _deathOracle = deathOracle;
    }

    function isEligible(address who, uint16 currentAge) external returns (bool) {
        return !_deathOracle.isDead(who); // TODO gate Age by fee to make the lottery
    }
}