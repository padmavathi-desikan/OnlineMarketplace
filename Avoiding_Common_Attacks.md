## Avioding Common Attacks

In this document I will list all the common attacks that I have come across so far.
The document is structured in following way for each attack :
* Introduction about the attack with example
* How I have avoided the attack in my project's smart contracts


### `Reentrancy attack`

#### Introduction:
    
 In this attack contract functions could be called repeatedly, before the first invocation of the function was finished.

#### Example:

 While withdrawing balance msg.sender.call.value(amountToWithdraw) function is used and then the user balance is made zero.
##### require(msg.sender.call.value(amountToWithdraw)());  
 `---> At this point, the caller's code is executed, and can call withdrawBalance again`
##### userBalances[msg.sender] = 0;

#### How it is avoided in Storefront smart contract:

   * I am using msg.sender.transfer function to send balance back to the shopper instead of msg.sender.call.value function.
    * Since transfer function has a gas limit of 2300 any attack would be able to only log an event but would be unsuccessful in launching any reentrancy attack.
    * I also ensured that I have completed all internal works such as subtracting the amount needed for buying a product from shopper, before refunding the amount to shopper by calling msg.sender.transfer function.

### `Logic Bugs`

   * The logic bugs are avoided in project by writing extensive test cases using javascript for each function in smart contract .
   * Coding standards were also followed to avoid such bugs.

### `Integer Arithmetic Overflow`

   This attack can happen while performing any arithmetic operations such as addition, subtraction,multiplication etc. 
  
#### Example:

While transfering amount from sender to receiver, the amount will be deducted from sender and added to receiver. If the balance of receiver reaches the maximum uint value (2^256) it will circle back to zero thus making a huge loss for the receiver.

#### How it is avoided in our project smart contract:

* I have used the SafeMath library for implementing any arithmetic operations.
* The SafeMath library prevents integer overflow or underflow while performing any arithmetic operations and is a widely used library.

### `Poison Data`

* User inputs such as store owner address, product input data are validated before passing them to smart contracts in our project.
* In each smart contract many modifiers (require conditions) are used for validation before performing a specific task.

### `Timestamp Dependence`

The timestamp of the block can be manipulated by the miner, and so should not be used for critical components of the contract.

#### Example:

   `uint256 constant private time =  block.timestamp;`

#### How it is avoided in our project smart contract:

I have not used block timestamp related calculation in any of my smart contracts and hence they are free from this attack.


### `Tx.Origin Attack`

* Tx.origin is the original sender of a transaction and whereas msg.sender is the immediate sender. 
* Consider the example,if some  contract C2 calls your contract, msg.sender will be the address of the contract `C2` and not the address of the user `U1` who called the contract.

#### How it is avoided in our project smart contract:

To  avoid the above problems in my project's smart contracts I have used only `msg.sender` instead of `tx.origin`.
      
### `Gas Limit Attack`

Gas limit can happen when you try to loop over an array of unknown size. 

#### Example:
By paying out to all shoppers at once, you risk running into the block gas limit. 

#### How it is avoided in our project smart contract:

In the storefront contract, I refund the shoppers only one at a time when I receive an order to buy a product thus avoiding any gas limit attack.
