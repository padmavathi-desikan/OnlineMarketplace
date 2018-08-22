## Instructions to run the project

In the Unix terminal , go inside truffle project folder where you have downloaded project from git and run the commands below in given order:

* npm install

* npm install -E openzeppelin-solidity

* truffle compile

* truffle migrate --reset

* truffle test

* npm run dev


## Project Intro

Our project describes a online marketplace that will be represent by 5 overarching smart contracts:

* `Admin`
* `StoreOwner`
* `StoreFront`
* `Owner`
* `Pausable`
* `StoreOwnerFactory`

The other elements of the system are represented by externally owned accounts:

* owner of `StoreOwner`
* owner of `StoreFronts`

## Smart contracts

### Admin

  An admin manages store owners.Two main functionality of admin is adding new approved store owners or removing existing store owners.The Admin contract also includes functionality to add a new Admin or remove an existing Admin.

  The state variables used in Admin contract include:

  * `admins` - a mapping between admin addresses to a boolean value that indicates whether the admin is Added(Active) or Removed(Inactive). 

  * `storeowners` - a mapping between storeowner addresses to a boolean value that indicates whether the storeowner is Added(Active) or Removed(Inactive).

   * `storeownercontracts` - a mapping between storeowner addresses to their contract address where the store owner contract has been deployed.

The modifiers in Admin contract include:

* `isAdmin` - is used to validate if a given account is an Admin account to add or remove admins as well as add or remove storeowners.

* `isValidAdmin` - is used to validate if the Admin account already exists.This modifier is used while removing an Admin.

* `isNotAdminYet` - is used to validate if the Admin account does not exists or is Inactive. This modifier is used while adding new Admin or reactivate an Admin.

* `isValidStoreOwner` - is used to validate if the Store Owner account already exists.This modifier is used while removing a Store Owner.

* `isNotStoreOwner` - is used to validate if the Store Owner account does not exists or is Inactive. This modifier is used while adding new Store Owner or reactivate a Store Owner.

The events in Admin contract include:

* `AddedAdmin` - This event is logged when a new admin is added.

* `RemovedAdmin` - This event is logged when a existing admin is removed or inactivated.

* `AddedStoreOwner` - This event is logged when a new store owner is added.

* `RemovedStoreOwner` - This event is logged when a existing store owner is removed or inactivated.

It also contains a fallback function that rejects all incoming calls.

### StoreOwner

A store owner manages storefronts.Two main functionality of store front is adding new approved store fronts or removing existing store fronts. The store owner can also view all store fronts he has created so far.

The state variables used in Store Owner contract include:

  * `storefronts` - a mapping between store front addresses to a boolean value that indicates whether the store front is Added(Active) or Removed(Inactive). 

The modifiers in Store Owner contract include:

* `isValidStoreFront` - is used to validate if the Store Front already exists.This modifier is used while removing a Store Front or making it inactive.

The events in Store Owner contract include:

* `AddedStoreFront` - This event is logged when a new store front is added by store owner.

* `RemoveStoreFront` - This event is logged when a existing store front is removed or inactivated by store owner.

It also contains a fallback function that rejects all incoming calls.

### StoreFront

The main functionalities of store front includes the following:

* A storefront allows a store owner to add products to it or remove products from it.  
* A store owner can change any of the products’ prices in that particular storefront. 
* A store owner can also withdraw any funds that the store front has collected from sales.
* A shopper can buy available item from store front.

The state variables used in Store Front contract include:

  * `products` - a mapping between 
  product id and its details such as name,price etc.
  * `balance` - it represent the funds of storefront collected from sales since the last withdrawal by store owner.
  * `pidCount` - it represents a counter that automatically increments whenever a new product is added, acts as the id of the product.

The modifiers in Store Front contract include:

* `paidEnough` - it validates if enough amount is paid by shopper for buying the product
* `checkValue` -After buying the product it checks for extra amount paid if any and refunds it back to the shopper.
* `balanceAvailable` - it validates if balance is available while store owner withdraw funds from store front.
* `quantityAvailable` - it validates if enough quantity of the product is available as requested by shopper.

The events in Store Front contract include:

* `AddedProduct` - This event is logged when a new product is added to store front.
* `RemovedProduct` - This event is logged when a existing product is removed from store front.
* `ChangedPriceProduct` - This event is logged when a product price is changed by store owner. 
* `ItemBought` - This event is logged when a product is bought by a shopper.
* `AmountRefunded` - This event is logged when a excess amount is refunded back to shopper after buying a product.
* `WithdrewFunds` - This event is logged when a store owner withdraws funds collected by sales from his storefront.

It also contains a fallback function that rejects all incoming calls.

### `Owned`

It has a owner address and 

* a modifier named `fromOwner` that rolls back the transaction if the transaction sender is not the owner.
* a modifer `isValidAddress` to check if input address from user is not zero.
* a function `setOwner` that ensures the new owner is a valid address and not the current owner itself and changes the owner.
* a constant function `getOwner` that returns the value of the current owner of the contract
* An event `LogOwnerSet` is logged when the owner is being set or modified to new owner.

### `Pausable`

It has a boolean variable `paused` and

* a modifier named `whenPaused` that rolls back the transaction if the contract is in the `false` paused state.
* a modifier named `whenNotPaused` that rolls back the transaction if the contract is in the `true` paused state
* a constructor that takes in no parameter and initial state is not paused.
* a constant function `isPaused` that returns a boolean value that tells whether the contract is currently paused
* a function `setPaused` that pauses the contract
* An event `LogPausedSet` is logged when the paused variable is reset.

### `StoreOwnerFactory`

* a state variable `storeownercontracts` that is a array containing list of all storeowner contracts.
* a function `newStoreOwner` to add new store owner contract.
* a function `getSOContractCount` to get the store owner array length.

## How to Test From UI

* When the UI is up and running, the index page would identify the user logging in and navigate them to their respective page. Remember to have your ganache-cli running at backend, and log into metamask from browser using wallet seed given by ganache-cli before running the command `npm run dev`.
* If you have logged in as a Admin, you will be able to add StoreOwner. Copy an account address(eg Account 2) from Metamask and set it as a Store Owner.
* If you have logged in as a StoreOwner, you will be able to add store fronts. Using See All Stores button , you would be able to navigate into any added storefront. 
  * Inside storefront page store owner will be able to add products or remove products from a store front.
  * The store owner would also be able to modify price of products.
  * Store Owner can withdraw balance from the store front.
* If you have logged in as a Shopper, you will be able to view all Store Fronts and navigate to a specific store front and buy Products. 
* A small note , wait till the metamask shows `browsersynched : connected` or console shows `InstanceGot` comment for all functions to work correctly. Also kindly wait for the `Confirmed transaction notification` in a seperate dialog box from metamask to ensure that updates in UI are reflected correctly.



