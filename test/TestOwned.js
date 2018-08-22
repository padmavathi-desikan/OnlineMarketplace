const allArtifacts = {
    StoreOwnerFactory : artifacts.require("./StoreOwnerFactory.sol"),
    Owned: artifacts.require("./Owned.sol"),
    Pausable: artifacts.require("./Pausable.sol"),
    Admin: artifacts.require("./Admin.sol"),
    StoreOwner: artifacts.require("./StoreOwner.sol"),
    StoreFront: artifacts.require("./StoreFront.sol")
}

const constructors = {
    Owned: owner => allArtifacts.Owned.new({ from: owner }),
    StoreOwnerFactory : owner => allArtifacts.StoreOwnerFactory.new({ from: owner }),
    Pausable: owner => allArtifacts.Pausable.new({ from: owner }),
    Admin: owner => allArtifacts.Admin.new(constructors.StoreOwnerFactory.address,{ from: owner }),
    StoreOwner: owner => allArtifacts.StoreOwner.new({ from: owner }),
    StoreFront: owner => allArtifacts.StoreFront.new({ from: owner }),
};

contract('Owned inheritance tree', function(accounts) {

    let owner0, owner1, owned;
    const addressZero = "0x0000000000000000000000000000000000000000";

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 2);
        owner0 = accounts[0];
        owner1 = accounts[1];
    });

    Object.keys(constructors).forEach(name => {
        
        describe(name, function() {

            beforeEach("should deploy a new " + name, function() {
                return constructors[name](owner0)
                    .then(instance => owned = instance);
            });

            describe("getOwner", function() {

                /*
	            *This test case validates if owner value is fetched correctly.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */
                it("should have correct initial value", function() {
                    return owned.getOwner()
                    .then(owner => assert.strictEqual(owner, owner0));
                });
                /*
	            *This test case validates if owner can be fetched from any address.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to ask for owner from any address", function() {
                    return owned.getOwner({ from: owner1 })
                    .then(owner => assert.strictEqual(owner, owner0));
                });

            });

            describe("setOwner", function() {
                /*
	            *This test case validates if exception is thrown while trying to set new owner from wrong owner.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set owner if asking from wrong owner", function() {
                    return owned.setOwner(owner1, { from: owner1, gas: 3000000})
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case validates if exception is thrown while trying to set new owner for address zero.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set owner if to 0", function() {
                    return owned.setOwner(addressZero, { from: owner0, gas: 3000000})
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });

                });

                /*
	            *This test case validates if exception is thrown while trying to set new owner when there is no change in owner.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set owner if no change", function() {
                    return owned.setOwner(owner0, { from: owner0, gas: 3000000})
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case checks if the new owner is set correctly.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to set owner", function() {
                    return owned.setOwner(owner1, { from: owner0, gas: 3000000 })
                    .then(tx => {
                    const logChanged = tx.logs[0];
                    assert.strictEqual(logChanged.event, "LogOwnerSet");
                    assert.strictEqual(logChanged.args.oldOwner, owner0);
                    assert.strictEqual(logChanged.args.newOwner, owner1);
                    return owned.getOwner();
                    })
                    .then(owner => assert.strictEqual(owner, owner1));
                });

            });

            describe("setOwner a second time", function() {

                beforeEach("should set owner once", function() {
                    return owned.setOwner(owner1, { from: owner0 });
                });

                /*
	            *This test case validates if exception is thrown while trying to set new owner from wrong owner.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set owner if asking from wrong one", function() {
                    return owned.setOwner(owner0, { from: owner0, gas: 3000000 })
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case checks if the new owner is set correctly.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to set owner again", function() {
                    return owned.setOwner.call(owner0, { from: owner1 })
                        .then(success => assert.isTrue(success))
                        .then(() => owned.setOwner(owner0, { from: owner1 }))
                        .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 1);
                            assert.strictEqual(tx.logs.length, 1);
                            const logChanged = tx.logs[0];
                            assert.strictEqual(logChanged.event, "LogOwnerSet");
                            assert.strictEqual(logChanged.args.oldOwner, owner1);
                            assert.strictEqual(logChanged.args.newOwner, owner0);
                            return owned.getOwner();
                        })
                        .then(owner => assert.strictEqual(owner, owner0));
                });

            });

        });

    });

});
