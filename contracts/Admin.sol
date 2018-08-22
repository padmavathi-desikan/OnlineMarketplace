pragma solidity 0.4.24;

import "./Owned.sol";
import "./Pausable.sol";
import "./StoreOwner.sol";
import "./StoreOwnerFactory.sol";

/** 
*@title Admin .
*This smart contract handles functionality specific to Admin
*such as adding storeowner or admin, removing storeowner or admin.
*/

contract Admin is Owned, Pausable {

    StoreOwnerFactory sof;

    // create list of all admins and all storeowners 
    mapping(address => bool) public admins;
    mapping(address => bool) public storeowners;
    mapping(address => address) public storeownercontracts;

    // modifier to check if sender is actually admin
    modifier isAdmin() { require(admins[msg.sender]); _; }

    // modifier to check if storeowner does not exists or is inactive
    modifier isNotStoreOwner(address so) { require(storeowners[so] == false); _; }

    // modifier to check if storeowner exists

    modifier isValidStoreOwner(address so) { require(storeowners[so]); _; }

    // modifier to check if admin exists

    modifier isValidAdmin(address admin) { require(admins[admin]); _; }

    // modifier to check if admin does not exists or is inactive
    modifier isNotAdminYet(address admin) { require(admins[admin]  == false); _; }
     
    // events for adding, removing storeowners and admins
    event AddedStoreOwner(address storeownercontractaddress, address storeowneraddress);
    event RemovedStoreOwner(address storeowneraddress);

    event AddedAdmin(address adminaddress);
    event RemovedAdmin(address adminaddress);

    // constructor, owner is also an admin
    constructor(address _sof) public {
       admins[owner] = true;
       sof = StoreOwnerFactory(_sof);
    }

    /** @dev Adds a new StoreOwner.
    *   @param so Address of the Store Owner.
    *   @return address The new Storeowner contract address.
    */

    function addStoreOwner(address so)
    public
    whenNotPaused
    isValidAddress(so)
    isAdmin
    isNotStoreOwner(so)
    returns (address)
    {
        address trustedSO = sof.newStoreOwner(so);//new StoreOwner();
        
        storeowners[so] = true;
        storeownercontracts[so] = trustedSO;
        emit AddedStoreOwner(trustedSO,so);
        return trustedSO;
    }

    /** @dev Removes or inactivates StoreOwner.
    *   @param so Address of the Store Owner.
    *   @return true if StoreOwner is removed successfully.
    */

    function removeStoreOwner(address so)
    public
    isValidAddress(so)
    whenNotPaused
    isAdmin
    isValidStoreOwner(so)
    returns (bool)
    {
        storeowners[so] = false;
        emit RemovedStoreOwner(so);
        return true;
    }

    /** @dev Adds a new Admin.
    *   @param ad Address of the admin to be added.
    *   @return true if Admin is added successfully.
    */

    function addAdmin(address ad)
    public
    whenNotPaused
    isValidAddress(ad)
    isAdmin
    isNotAdminYet(ad)
    returns (bool)
    {
        admins[ad] = true;
        emit AddedAdmin(ad);
        return true;
    }

    /** @dev Removes or inactivates Admin.
    *   @param ad Address of the admin to be removed.
    *   @return true if Admin is removed successfully.
    */

    function removeAdmin(address ad)
    public
    whenNotPaused
    isValidAddress(ad)
    isAdmin
    isValidAdmin(ad)
    returns (bool)
    {
        admins[ad] = false;
        emit RemovedAdmin(ad);
        return true;
    }

    /** 
    * @dev Fallback method for Admin contract
    */

    function () public {
        revert();
    }

}