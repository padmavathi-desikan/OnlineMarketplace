pragma solidity 0.4.24;

import "./Owned.sol";
import "./Pausable.sol";
import "./StoreFront.sol";

/** 
* @title StoreOwner .
*This smart contract handles functionality specific to Storeowner
*such as adding storefront, removing storefront.
*/
contract StoreOwner is Owned, Pausable {

    // create list of all storefronts
    mapping(address => bool) public storefronts;

    //function modifier to validate if StoreFront exists
    modifier isValidStoreFront(address sf) { require(storefronts[sf]); _; }

    // event for adding storefront 
    event AddedStoreFront(address storefrontaddress, address indexed storeowneraddress);

    // event for removing storefront
    event RemoveStoreFront(address storefrontaddress, address indexed storeowneraddress);

    constructor() public {}

    /** @dev Adds a new approved StoreFront.
    *   @return address The new Storefront address.
    */
    function addStoreFront()
    public
    whenNotPaused
    fromOwner
    returns(address)
    {
        StoreFront trustedSF = new StoreFront();
        trustedSF.setOwner(owner);
        storefronts[trustedSF] = true;
        emit AddedStoreFront(trustedSF, owner);
        return trustedSF;
    }

    /** @dev Removes existing StoreFront by inactivating it.
    *   @param sf Storefront address to be removed.
    *   @return true if Storefront removed successfully
    */

    function removeStoreFront(address sf)
    public
    whenNotPaused
    isValidAddress(sf)
    fromOwner
    isValidStoreFront(sf)
    returns (bool)
    {
        storefronts[sf] = false;
        emit RemoveStoreFront(sf,owner);
        return true;
    }

    /** 
    * @dev Fallback method for Storeowner contract
    */
    function () public {
        revert();
    }

}