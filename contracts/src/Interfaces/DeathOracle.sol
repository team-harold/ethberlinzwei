pragma solidity ^0.5.0;

import "./Associate.sol";

interface DeathOracle { //} is Associate{
    function associate() external;
    function onJoined(address who, uint16 age) external;
    function isDead(address who) external view returns (bool);

    function debug_addTimeDelta(int256 delta) external;
}
