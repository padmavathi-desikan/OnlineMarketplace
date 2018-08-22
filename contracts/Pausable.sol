pragma solidity 0.4.24;

import "./Owned.sol";

/** 
* @title Pausable .
*This smart contract handles functionality based on emergency stop pattern
*such as setting contract paused or not.
*/

contract Pausable is Owned{

	//State of the smart contracts

	bool internal paused;

	//modifier to check if contract is paused

	modifier whenPaused(){
		require(paused);
		_;
	}

	//modifier to check if contract is not paused

	modifier whenNotPaused(){
		require(!paused);
		_;
	}

	constructor()
		public
	{
		paused = false;
	}

	//Event to log Paused state
	event LogPausedSet(address owner, bool state);

	/** @dev Returns state of the contract whether it is paused or not.
    *   @return true if paused,otherwise false.
    */

	function isPaused()
		constant
		public
		returns(bool)
	{
		return paused;
	}

	/** @dev Sets or modifies state of the contract.
	*   @param newState New state to be set.
    *   @return true if state was set successfully.
    */

	function setPaused(bool newState)
		fromOwner
		public
		returns(bool)
	{
		require(newState!=paused);
		
		paused = newState;
		emit LogPausedSet(owner,newState);
		
		return true;
	}


}