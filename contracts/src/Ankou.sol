pragma solidity 0.5.11;

import "./Interfaces/DeathOracle.sol";

contract Ankou is DeathOracle {

    struct Config {
        uint128 dieSize;
        uint16 everyXBlock;
    }

    Config config;

    mapping(uint256 => bytes32) blockHashes;
    address _associate;

    mapping (address => uint16) ages;

    constructor(uint128 dieSize, uint16 everyXBlock) public {
        config.dieSize = dieSize;
        config.everyXBlock = everyXBlock;
    }

    function associate() external {
        _associate = msg.sender;
    }

    function onJoined(address who, uint16 age) external {
        require(msg.sender == _associate, "only pre-registered associate allowed");
        ages[who] = age;
    }

    mapping(address => bool) dead;
    function isDead(address who) external returns (bool) {
        return dead[who];
    }

    function registerDeath(address who, uint256 blockNumber) external {
        require(blockNumber % config.everyXBlock == 0, "not a valid block number");
        bytes32 blockHash;
        if(blockNumber < block.number - 255) {
            blockHash = blockHashes[blockNumber];
        } else {
            blockHash = blockhash(blockNumber);
            blockHashes[blockNumber] = blockHash; // save for others
        }
        require(uint256(blockHash) != 0, "can't get blockhash");

        bool isDead = (uint256(keccak256(abi.encodePacked(blockHash, who))) % config.dieSize) == 0;
        require(isDead, "that person is not dead");
        dead[who] = isDead;
    }
}