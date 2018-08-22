var Admin = artifacts.require("Admin");

contract('Admin', function(accounts) {

    /*
	*This test case tests if the first account is set as owner.
	*The test case was written to check if the implicit requirement stated was executed correctly.
    */

    it("should set first account as owner", function() {
        return Admin.deployed().then(function(instance) {
            return instance.getOwner();
            }).then(function(isOwner) {
            assert.equal(isOwner, accounts[0], "first account should be set as owner");
        });
    });

    /*
	*This test case tests if the first account is set as admin.
	*The test case was written to check if the implicit requirement stated was executed correctly.
    */
   
    it("should set first account as admin", function() {
        return Admin.deployed().then(function(instance) {
            return instance.admins.call(accounts[0]);
            }).then(function(isAdmin) {
            assert.equal(isAdmin,true,"first account should be admin");
       });
    });

    /*
	*This test case tests the functionality of admin adding a new admin.
	*The test case was written to check if the implicit requirement was executed correctly.
    */
    
    it("should allow admin to add new admin", function() {
        return Admin.deployed().then(function(instance) {
            instance.addAdmin(accounts[1],{from: accounts[0]});
            return instance.admins.call(accounts[1]);
            }).then(function(isAdmin) {
            assert.equal(isAdmin,true,"should allow admin to add a new admin");
        });
    });

    /*
	*This test case tests the main functionality of adding store owner by admin.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */
    
    it("should allow admin to add new store owner", function() {
        return Admin.deployed().then(function(instance) {
            instance.addStoreOwner(accounts[2],{from: accounts[1]} );
            return instance.storeowners.call(accounts[2]);
            }).then(function(isStoreOwner) {
            assert.equal(isStoreOwner,true,"should allow admin to add a new storeowner");
        });
    });

    /*
	*This test case tests the main functionality of removing store owner by admin.
	*The test case was written to check if the explicit functional requirement stated was executed correctly.
    */
    
    it("should allow admin to remove existing store owner", function() {
        return Admin.deployed().then(function(instance) {
            instance.removeStoreOwner(accounts[2],{from: accounts[1]} );
            return instance.storeowners.call(accounts[2]);
            }).then(function(isStoreOwner) {
            assert.equal(isStoreOwner,false,"should allow admin to remove a existing storeowner");
        });
    });

    /*
	*This test case tests the functionality of admin removing a admin.
	*The test case was written to check if the implicit requirement was executed correctly.
    */

    it("should allow admin to remove existing admin", function() {
        return Admin.deployed().then(function(instance) {
            instance.removeAdmin(accounts[1],{from: accounts[0]} );
            return instance.admins.call(accounts[1]);
            }).then(function(isAdmin) {
            assert.equal(isAdmin,false,"should allow admin to remove a existing admin");
        });
    });


    /*
	*This test case validates that only a admin will be able to add new admin.
	*The test case was written to check if the implicit requirement was executed correctly.
    */
    
    it("should not allow non admin to add new admin",function() {
        return Admin.deployed().then(function(instance) {
            return instance.addStoreOwner(accounts[2],{from: accounts[1]});
            }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });


    /*
	*This test case validates that only a admin will be able to add new storeowner.
	*The test case was written to check if the implicit requirement was executed correctly.
    */
    
    it("should not allow non admin to add new store owner",function() {
        return Admin.deployed().then(function(instance) {
            return instance.addAdmin(accounts[2],{from: accounts[1]});
            }).catch(function(error) {
            assert.notEqual(error, undefined, 'Exception thrown');
            assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
        });
    });
});