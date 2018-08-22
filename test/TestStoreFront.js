var StoreFront = artifacts.require("StoreFront");
var Admin = artifacts.require("Admin");
var StoreOwner = artifacts.require("StoreOwner");

contract('StoreFront', function(accounts) {

    let storefrontcontractaddress;

    //setting up the storeowner and storefront before testing storeofront functionalities

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 4);
        var storeownercontractaddress;
        return Admin.deployed().then(function(instance) {
            return instance.addStoreOwner(accounts[3],{from: accounts[0]} );
            }).then(function(tx) {
                storeownercontractaddress = tx.logs[1]["args"]["storeownercontractaddress"];
                return StoreOwner.at(storeownercontractaddress)
            }).then(function(instance) {
                return instance.addStoreFront({from: accounts[3]})
            }).then(function(tx) {
                //console.log(tx.logs[1]);
                storefrontcontractaddress = tx.logs[1]["args"]["storefrontaddress"];
            });
    });


    /*
	*This test case tests the main functionality of adding products to specific storefront by store owner.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */
    
    it("should allow store owner to add new products", function() {
        var owner;
        var storeFront;
        var item1,item2,item3,item4,item5;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
          storeFront = instance;
          return storeFront.addProduct("Rice",20,250,{from : accounts[3]});
        }).then(function(result) {
            item1 = result.logs[0]["args"]["productid"];
            return storeFront.addProduct("Wheat",15,200,{from : accounts[3]});
        }).then(function(result) {
            item2 = result.logs[0]["args"]["productid"];
            //console.log(result.logs[0]["args"]["price"]);
            return storeFront.addProduct("Eggs", 6,150,{from : accounts[3]});
        }).then(function(result) {
            item3 = result.logs[0]["args"]["productid"];
            return storeFront.addProduct("Sugar",10,100,{from : accounts[3]});
        }).then(function(result) {
            item4 = result.logs[0]["args"]["productid"];
            return storeFront.addProduct("Salt",5,50,{from : accounts[3]});
        }).then(function(result) {
            item5 = result.logs[0]["args"]["productid"];
            assert.equal(item1,1,"first product should be added");
            assert.equal(item2,2,"second product should be added");
            assert.equal(item3,3,"third product should be added");
            assert.equal(item4,4,"fourth product should be  added");
            assert.equal(item5,5,"fifth product should be added");
        });
    });

    /*
	*This test case tests the main functionality of removing products from specific storefront by store owner.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */

    it("should allow store owner to remove products", function() {
        var itemId = 5;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
          instance.removeProduct(itemId,{from : accounts[3]});
          return instance.products.call(itemId);
        }).then(function(result) {
            assert.equal(result[0],false,"fifth product should be removed");
        });
    });

    /*
	*This test case tests the main functionality of changing product's price by store owner.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */

    it("should allow store owner to change product price", function() {
        var itemId = 1;
        var newPrice=25;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
          instance.changePrice(itemId,newPrice,{from : accounts[3]});
          return instance.products.call(itemId);
        }).then(function(result) {
            assert.equal(result[3],25,"first product price should be changed as 25");
        });
    });

    /*
    *This test case tests the main functionality of changing removed product's price by store owner.
    *The test case was written to check if the implicit functional requirement stated was executed correctly.
    */

    it("should not allow store owner to change product price", function() {
        var itemId = 5;
        var newPrice=25;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
          return instance.changePrice(itemId,newPrice,{from : accounts[3]});
        }).catch(function(error) {
          assert.notEqual(error, undefined, 'Exception thrown');
          assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });

    /*
	*This test case tests the main functionality of buying a product by shopper from specific storefront.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */

    it("should allow shopper to buy product", function() {
        var itemId = 2;
        var quantity=6;
        var storefrontcontract;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
            storefrontcontract = instance;
            return instance.buyProduct(itemId,quantity,{from: accounts[5],value: web3.toWei("50.0","ether")});
        }).then(function(tx) {
          return storefrontcontract.products.call(itemId);
        }).then(function(result) {
            assert.equal(result[4],194,"second product quantity should be changed as 194");
            return web3.eth.getBalance(storefrontcontractaddress);
        }).then(function(bal) {
            var balance = bal.toNumber();
            assert.isAbove(balance,0,"balance must be greater than 0");
        });
    });

    /*
    *This test case tests the main functionality of buying a removed product by shopper from specific storefront.
    *The test case was written to check if the implicit functional requirement stated was executed correctly.
    */

    it("should not allow shopper to buy removed product", function() {
        var itemId = 5;
        var quantity=1;
        var storefrontcontract;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
            storefrontcontract = instance;
            return instance.buyProduct(itemId,quantity,{from: accounts[5],value: web3.toWei("50.0","ether")});
        }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });

    /*
	*This test case tests the main functionality of withdrawing funds from specific storefront by store owner.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */
    it("should allow storeowner to withdraw money", function() {
        var storefrontcontract, ownerBeforeBalance, withdrawnBalance, ownerAfterBalance;
        return StoreFront.at(storefrontcontractaddress).then(function(instance) {
            storefrontcontract = instance;
            return web3.eth.getBalance(accounts[3]);
            }).then(function(bal) {
            ownerBeforeBalance = bal.toNumber();
            return storefrontcontract.withdraw({from: accounts[3]});
            }).then(function(tx) {
            //console.log(tx["receipt"]["gasUsed"] * web3.eth.gasPrice);
            withdrawnBalance = tx.logs[0]["args"]["balance"].toNumber();
            }).then(function() {
            return web3.eth.getBalance(storefrontcontractaddress);
            }).then(function(bal) {
            var balance = bal.toNumber();
            assert.equal(balance,0,"contract's balance must be 0 after");
            return web3.eth.getBalance(accounts[3]);
            }).then(function(bal2) {
            ownerAfterBalance = bal2.toNumber();
            //console.log(ownerAfterBalance + " " + ownerBeforeBalance);
            //assert.isAbove(ownerAfterBalance,ownerBeforeBalance,"owner's balance must increase after");
            });
    });



});