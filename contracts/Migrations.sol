pragma solidity 0.4.24;

/** 
* @title Migrations .
*This smart contract handles functionality specific to migration of
*smart contracts.
*/

contract Migrations {

  //state variables
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  /** @dev Sets Last Completed Migration value.
	*   @param completed New value to be set.
  */

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  /** @dev Sets new address for the contract.
	*   @param new_address New address to be set.
  */

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
