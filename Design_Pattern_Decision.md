## Design Patterns for the Online Marketplace Project

In this document we cover the list of design patterns that were used in this project.

### `Checks-Effects-Interaction Pattern:`

* The Checks-Effects-Interaction Pattern aims at solving problems occured due to a scenario described as follows:

  * A contract  calls  another contract and  hands  over  control to that other contract. 
  * The called contract tries to re-enter the contract by which it was called and manipulate its state or hijack the control flow through malicious code.

* In order to avoid this,this pattern defines a certain order of actions as described below:
   * First,  check all  the  preconditions
   * Secondly  make  changes  to  the  contract’s state and 
   * Finally interact with other contracts.

#### Application in Project:
* All the smart contracts in online marketplace project follows a similar pattern.For example in storefront contract we refund our shoppers who buy a product only after validating if enough amount is available to buy the product, then deduct that amount from shopper and finally refund the remaining amount to the shopper.

### `Withdrawal Pattern:`

* Withdrawal pattern is the recommended method of sending funds. This pattern aims at solving problem occured due to a scenario described as follows:

#### Example:

Consider an simple auction contract where everyone can send their bids during a bidding period.If the highest bid is raised, the previously highest bidder gets her money back.Sending back the money by simply using`highestBidder.send(highestBid)` is a security risk because it could execute an untrusted contract.It is always safer to let the recipients withdraw their money themselves.

#### Application in Project:
*  All the smart contracts in online marketplace project follows a similar pattern.For example in storefront contract whenever a store owner wants to withdraw balance from his storefront ,he needs to initiate a transaction to get the balance of the store front and withdrawal does not happen automatically.

### `Emergency Stop (Circuit Breaker)`

* The emergency stop pattern aims at solving problem that when a deployed  contract is executed autonomously on  the Ethereum network, there is no option to halt its execution in case of a major bug or security issue.

#### Application in Project:
* The `Pausable` contract in Online Marketplace follows the emergency stop pattern.All the smart contracts inherit this emergency stop functionality that can be used in case of some issue. We have placed `Stop Admin`, `Stop StoreOwner`,`Stop StoreFront` buttons in the UI to implement the emergency stop functionality.

### `Factory Contract Pattern:`

* Factory contract is used to create and deploy multiple “child” contracts. The factory is used for storing the child contracts’ addresses so that they can be extracted whenever necessary. By storing them in the contract they remain in the blockchain where they are pretty much safe.

#### Example:

A toy shop is selling toys and keeping track of those toys. Each toy is a individual contract having properties such as name,type,price,manufacturer. The toy shop has a list of all the toys that were sold. Here the toy shop is the factory contract and each toy that belongs to the toy shop is its child contract.
  
#### Application in Project:

In Online Marketplace project we have used store owner factory contract to store the list of all storeowners. This helps us to display all storefronts to the shopper irrespective of which store owner the store front belongs to.

### `Mapping Iterator Pattern:`

Mapping in Solidity are used to store key value pairs. Many times we may need to iterate a mapping, but since mappings in Solidity cannot be iterated, the Mapping Iterator pattern turns out to be extremely useful.

#### Application in Project:

We have used mapping in our project for list of storeowners and whether they are active or inactive. We have also mapped product id with their corresponding details. Whenever we need to need to remove a storeowner,storefront or product we simply call the respective address and make it false. This helps in easy maintainability as it is tough to make any changes to the blockchain once they are added.

The above design patterns have been used in Online Marketplace project and their applications has been mentioned above.
In addition to the design patterns, a few more exists but we have not used it in our project because there was no use case that needed to use these patterns.

### `Name Registry Pattern:`

Name Registry Pattern helps in solving the scenario when there are multiple factories contracts and in turn these factories have number of addresses registered with them. Keeping all those addresses inside your app’s code would become very difficult in managing them. This pattern works by storing a mapping `contract name => contract address` so each address can be looked up from within the DApp by calling `getAddress.("FactoryName")`

#### Example:

A blockchain copy of Walmart store makes use of ClothesFactoryContract, GamesFactoryContract, BooksFactoryContract,FurnitureFactoryContract etc. 

#### Why it is not used in our project:

In onlinemarketplace project, we only need a factory contract for storeowner and hence we did not require a name registry pattern. This pattern can be looked upon in the future when the complexity of the project increases.