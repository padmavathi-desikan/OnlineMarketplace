pragma solidity 0.4.24;

import "./Owned.sol";
import "./Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/** 
* @title StoreFront .
*This smart contract handles functionality specific to Storefront
*such as adding products, removing products,changing product price,
*buying a product from Storefront and withdraw funds from Storefront.
*/
contract StoreFront is Owned, Pausable {

    using SafeMath for uint;
    uint pidCount;
    uint private balance;

    //create list of all products 
    mapping(uint => Product) public products;

    struct Product {
        bool exists;
        uint pid;
        bytes32 pname;
        uint price;
        uint quantity;
    }

    // event logged while adding a product by storeowner
    event AddedProduct(address indexed sfowner, uint productid, bytes32 productname, uint price, uint quantity);

    // event logged while removing a product by storeowner
    event RemovedProduct(address indexed sfowner, uint productid, bytes32 productname, uint price, uint quantity);

    // event logged while changing product price by store owner
    event ChangedPriceProduct(address sfowner, uint productid, uint newPrice);

    // event logged when shopper buys an item
    event ItemBought(uint productid, uint quantity, uint totalBalance);

    //event logged when excess amount refunded to shopper
    event AmountRefunded(address buyer, uint amountRefunded);
    
    // event for when store owner withdraws funds from the storefront
    event WithdrewFunds(address owner, uint balance);
    

    //modifier to check if shopper has paid enough for buying a product
    modifier paidEnough(uint _price) { require(msg.value >= _price); _;}

    //modifier to check the excess amount paid is refunded to shopper
    modifier checkValue(uint _pid, uint _qty) {
        //refund them after pay for item, _ checks for logic before func
        _;
        uint _price = products[_pid].price.mul(_qty);
        uint amountToRefund = msg.value.sub(_price);
        emit AmountRefunded(msg.sender, amountToRefund);
        msg.sender.transfer(amountToRefund);
    }

    //modifier checks if balance is available while withdrawing funds by storeowner
    modifier balanceAvailable() { require(balance > 0); _;}

    // modifier checks if enough quantity is available while shopper is purchasing a product
    modifier quantityAvailable(uint _pid, uint _qty) { require(products[_pid].quantity >= _qty); _;}

    constructor() public {
        pidCount = 1;
    }

    /** @dev Adds a product to the Storefront.
    *   @param _name Name of the product to be added.
    *   @param _price Price of the product to be added.
    *   @param _quantity Quantity of the product to be added.
    *   @return Unique Id of the product successfully added
    */

    function addProduct(bytes32 _name,uint _price, uint _quantity)
    public
    whenNotPaused
    fromOwner
    returns(uint)
    {
        emit AddedProduct(owner, pidCount, _name, _price, _quantity);
        products[pidCount] = Product({exists: true, pid: pidCount, pname: _name, price:_price, quantity: _quantity});
        pidCount = pidCount.add(1);
        return pidCount.sub(1);
    }

    /** @dev Removes or inactivate a product from the Storefront.
    *   @param _pid Product ID to be removed.
    *   @return true when the product is successfully removed.
    */

    function removeProduct(uint _pid)
    public
    whenNotPaused
    fromOwner
    returns(bool)
    {
        require(products[_pid].exists);
        Product storage currentProduct = products[_pid];
        emit RemovedProduct(owner, _pid, currentProduct.pname, currentProduct.price, currentProduct.quantity);
        products[_pid].exists = false;
        return true;
    }

    /** @dev Changes price of a product in the Storefront.
    *   @param _pid Product ID.
    *   @param new_price New price of the product.
    *   @return true when the product price is changed successfully.
    */

    function changePrice(uint _pid, uint new_price)
    public
    whenNotPaused
    fromOwner
    returns(bool)
    {
        require(products[_pid].exists);
        emit ChangedPriceProduct(owner, _pid, new_price);
        products[_pid].price = new_price;
        return true;
    }

    /** @dev Allows Storeowner to withdraw funds from Storefront.
    *   @return true when balance withdrawn successfully.
    */

    function withdraw()
    public
    whenNotPaused
    fromOwner
    balanceAvailable
    returns(bool)
    {
        uint oldBalance = balance;
        balance = 0;
        owner.transfer(oldBalance);
        emit WithdrewFunds(owner, oldBalance);
        return true;
    }

    /** @dev Allows Shopper to buy a product from the Storefront.
    *   @param _pid Product ID.
    *   @param _qty Quantity of the product to be purchased.
    *   @return true if the product was purchased successfully.
    */

    function buyProduct(uint _pid, uint _qty)
    public
    payable
    whenNotPaused
    quantityAvailable(_pid, _qty)
    paidEnough(products[_pid].price*_qty)
    checkValue(_pid, _qty)
    returns(bool)
    {
        require(products[_pid].exists);
        products[_pid].quantity = products[_pid].quantity .sub(_qty);
        balance = balance.add(products[_pid].price*_qty);
        emit ItemBought(_pid, _qty, balance);
        return true;
    }

    /** 
    * @dev Fallback method for Storefront contract
    */
    function () public {
        revert();
    }

}