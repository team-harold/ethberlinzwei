pragma solidity 0.5.11;

import "./Interfaces/EligibilityOracle.sol";
import "./Interfaces/DeathOracle.sol";

contract AlwaysEligibleUnlessDead is EligibilityOracle {

    mapping (address => bool) members;

    address _associate;
    DeathOracle _deathOracle;
    constructor(DeathOracle deathOracle) public {
        _deathOracle = deathOracle;
    }

    function associate() external {
        _associate = msg.sender;
        _deathOracle.associate();
    }

    function onJoined(address who, uint16 age) external {
        require(msg.sender == _associate, "only pre-registered associate allowed");
        members[who] = true;
        _deathOracle.onJoined(who, age);
    }

    function isEligible(address who, uint16 currentAge) external view returns (bool) {
        return members[who] && !_deathOracle.isDead(who);
    }
}