pragma solidity 0.5.11;

contract WelfareFund {

    struct Person {
        uint16 joiningAge; // we assume nobody can leave more than 65535 years
        uint256 contribution;
    }

    mapping(address => Person) persons;

    constructor() public {

    }

    function join(uint16 joiningAge) external {
        require(joiningAge > 0, "need to have lived at least a year");
        require(persons[msg.sender].joiningAge == 0, "cannot register twice");
        persons[msg.sender].joiningAge = joiningAge;
    }

    function payIn() external {

    }

    function claimPayOut() external {

    }
}