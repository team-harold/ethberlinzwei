pragma solidity ^0.5.0;

import "./Associate.sol";

interface DeathOracle { //} is Associate{
    function associate() external;
    function onJoined(address who, uint16 age) external;
    function isDead(address who) external returns (bool);
}
