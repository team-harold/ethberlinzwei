pragma solidity ^0.5.0;

interface DeathOracle {
    function isDead(address who) external returns (bool);
}
