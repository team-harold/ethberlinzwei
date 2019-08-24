pragma solidity 0.5.11;

import "./Interfaces/DeathOracle.sol";

contract Ankou is DeathOracle {

    mapping(address => bool) dead;
    function isDead(address who) external returns (bool) {
        return dead[who];
    }

    function registerDeath(address who) external {

    }
}