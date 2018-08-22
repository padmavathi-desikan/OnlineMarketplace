pragma solidity 0.4.24;

/** 
* @title Owner .
*This smart contract handles functionality specific to Owner
*such as getting owner, setting owner.
*/

contract Owned{

	//Address of the owner

	address internal owner;

	//modifier to check if it is owner

	modifier fromOwner(){
		require(msg.sender == owner);
		_;
	}

	//modifier to check if input address is not zero
    modifier isValidAddress(address ad){ 
		require(ad != 0); 
		_; 
	}

	// Set Owner Event
	event LogOwnerSet(address oldOwner, address newOwner);

	constructor() public {
		owner = msg.sender;
	}

	/** @dev Returns owner of the contract.
    *   @return address of owner.
    */

	function getOwner()
		public
		constant 
		returns(address)
	{
		return owner;
	}

	/** @dev Sets or modifies owner of the contract.
	*   @param newOwner New owner address to be set.
    *   @return true if owner changed successfully.
    */

	function setOwner(address newOwner) 
		public
		fromOwner
		returns(bool)
	{
		require(newOwner != owner);
		require(newOwner != 0);

		emit LogOwnerSet(owner, newOwner);
		owner = newOwner;

		return true;
	}


}