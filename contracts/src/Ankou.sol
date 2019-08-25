pragma solidity 0.5.11;

import "./Interfaces/DeathOracle.sol";

contract Ankou is DeathOracle {

    uint256 constant NUM_SECONDS_IN_A_YEAR = 31556952;
    uint256 constant NUM_SECONDS_IN_A_MONTH = NUM_SECONDS_IN_A_YEAR / 12; // 2629746;

    mapping(uint256 => bytes32) blockHashes;
    address _associate;
    uint32[] _probabilities;
    uint32 _everyXBlock;

    struct Person {
        uint16 joiningAge;
        uint64 startTime;
        bool dead;
    }
    mapping (address => Person) _persons;

    constructor(uint32[] memory probabilities, uint32 everyXBlock) public {
        _everyXBlock = everyXBlock;
        _probabilities = probabilities;
    }

    function associate() external {
        _associate = msg.sender;
    }

    function onJoined(address who, uint16 age) external {
        require(msg.sender == _associate, "only pre-registered associate allowed");
        _persons[who].joiningAge = age;
        _persons[who].startTime = uint64(_getTime());
    }

    
    function isDead(address who) external view returns (bool) {
        // require(_persons[who].joiningAge != 0, "not registered");
        return _persons[who].dead;
    }

    function registerDeath(address who, uint256 blockNumber) external {
        require(!_persons[who].dead, "already dead");
        
        require(blockNumber % _everyXBlock == 0, "not a valid block number");

        uint16 joiningAge = _persons[who].joiningAge;
        require(joiningAge != 0, "not registered");

        uint16 ageIndex = joiningAge + uint16((_getTime() - _persons[who].startTime) / NUM_SECONDS_IN_A_YEAR) -1;
        
        bool isDead = true;
        if(ageIndex < _probabilities.length) {
            uint32 proba = _probabilities[ageIndex];

            bytes32 blockHash;
            if(blockNumber < block.number - 255) {
                blockHash = blockHashes[blockNumber];
            } else {
                blockHash = blockhash(blockNumber);
                blockHashes[blockNumber] = blockHash; // save for others
            }
            require(uint256(blockHash) != 0, "can't get blockhash");

            isDead = (uint256(keccak256(abi.encodePacked(blockHash, who))) % 1000000) < proba;
        }
        require(isDead, "that person is not dead");
        _persons[who].dead = isDead;
    }


    int256 _timeDelta;
    function _getTime() internal view returns(uint256) {
        return uint256(int256(block.timestamp) + _timeDelta);
    }

    function debug_addTimeDelta(int256 delta) external {
        _timeDelta += delta;
    }
}