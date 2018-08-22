var Admin = artifacts.require("Admin");
var StoreOwner = artifacts.require("StoreOwner");

contract('StoreOwner', function(accounts) {

	let storeownercontractaddress, storefront;

	//setting up the storeowner before testing storeowner functionalities
	before("should prepare", function() {
		assert.isAtLeast(accounts.length, 4);
        return Admin.deployed().then(function(instance) {
            return instance.addStoreOwner(accounts[2],{from: accounts[0]} );
            }).then(function(tx) {
            	//console.log(tx.logs[1]);
            	storeownercontractaddress = tx.logs[1]["args"]["storeownercontractaddress"];
        	});
    });

	/*
	*This test case tests the main functionality of adding storefronts by store owner.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
	*/
    it("should allow storeowner to add new store fronts", function() {
    	var storeownercontract;
        return StoreOwner.at(storeownercontractaddress).then(function(instance) {
        	storeownercontract = instance;
	        return storeownercontract.addStoreFront({from: accounts[2]});
	        }).then(function(tx) {
	        storefront = tx.logs[1]["args"]["storefrontaddress"];
	        return storeownercontract.storefronts.call(storefront);
	    	}).then(function(isStoreFront) {
	        assert.equal(isStoreFront,true,"should allow storeowner to add new store fronts");
	    	});
    });

	/*
	*This test case tests the main functionality of removing storefronts by store owner
	*The test case was written to check if the explicit functional requirement stated are executed correctly.
	*/
    it("should allow storeowner to remove store front", function() {
    	var storeownercontract;
        return StoreOwner.at(storeownercontractaddress).then(function(instance) {
        	storeownercontract = instance;
	        return storeownercontract.removeStoreFront(storefront,{from: accounts[2]});
	        }).then(function(tx) {
	        return storeownercontract.storefronts.call(storefront);
	    	}).then(function(isStoreFront) {
	        assert.equal(isStoreFront,false,"should allow storeowner to remove store front");
	    	});
    });

	/*
	*This test case validates that only a storeowner will be able to add storefronts
	*The test case was written to check if the implicit requirement was executed correctly.
	*/
    it("should not allow non storeowner to add new store fronts", function() {
    	var storeownercontract;
        return StoreOwner.at(storeownercontractaddress).then(function(instance) {
        	storeownercontract = instance;
	        return storeownercontract.addStoreFront({from: accounts[3]});
	        }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });

	/*
	*This test case validates that only a storeowner will be able to remove storefronts
	*The test case was written to check if the implicit requirement was executed correctly.
	*/
    it("should not allow non storeowner to remove store front", function() {
    	var storeownercontract;
        return StoreOwner.at(storeownercontractaddress).then(function(instance) {
        	storeownercontract = instance;
	        return storeownercontract.removeStoreFront(storefront,{from: accounts[3]});
	        }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });	

	/*
	*This test case validates exception thrown when storeowner is trying to remove a storefront that does not exists
	*The test case was written to check if the function reverts as expected when a exception arises.
	*/
    it("should throw exception when store front doesn't exist", function() {
    	var storeownercontract;
        return StoreOwner.at(storeownercontractaddress).then(function(instance) {
        	storeownercontract = instance;
	        return storeownercontract.removeStoreFront(storefront,{from: accounts[2]});
	        }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });

});