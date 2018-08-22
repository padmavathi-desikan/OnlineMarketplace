pragma solidity ^0.4.23;

import "./Owned.sol";
import "./Pausable.sol";
import "./StoreOwner.sol";

/** 
* @title StoreOwnerFactory .
*This factory contract is used to maintain a list of Storeowner
*contracts.
*/
contract StoreOwnerFactory is Owned, Pausable {

  // index of created contracts

  address[] public storeownercontracts;
  
  /** @dev Useful for knowing the row count in contracts index.
    * @return contractCount Returns store owner contract array length.
    */

  function getSOContractCount() 
    public
    constant
    returns(uint contractCount)
  {
    return storeownercontracts.length;
  }

  /** @dev Deploy a store owner contract and add it in array
    * @param storeOwner Indicates Store owner address
    * @return newContract Returns store owner contract address.
    */
  function newStoreOwner(address storeOwner)
    public
    returns(address newContract)
  {
    StoreOwner so = new StoreOwner();
    so.setOwner(storeOwner);
    storeownercontracts.push(so);
    return so;
  }
}