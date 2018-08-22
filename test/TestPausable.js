const allArtifacts = {
    StoreOwnerFactory : artifacts.require("./StoreOwnerFactory.sol"),
    Owned: artifacts.require("./Owned.sol"),
    Pausable: artifacts.require("./Pausable.sol"),
    Admin: artifacts.require("./Admin.sol"),
    StoreOwner: artifacts.require("./StoreOwner.sol"),
    StoreFront: artifacts.require("./StoreFront.sol")
}

const constructors = {
    //Owned: owner => allArtifacts.Owned.new({ from: owner }),
    Pausable: owner => allArtifacts.Pausable.new({ from: owner }),
    StoreOwnerFactory : owner => allArtifacts.StoreOwnerFactory.new({ from: owner }),
    Admin: owner => allArtifacts.Admin.new(constructors.StoreOwnerFactory.address, { from: owner }),
    StoreOwner: owner => allArtifacts.StoreOwner.new({ from: owner }),
    StoreFront: owner => allArtifacts.StoreFront.new({ from: owner }),
};

contract('Pausable inheritance tree', function(accounts) {

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

            describe("isPaused", function() {

                /*
	            *This test case validates if initially the paused variable is set to false.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */
                it("should have correct initial value", function() {
                    return owned.isPaused()
                    .then(owner => assert.strictEqual(owner, false));
                });
                /*
	            *This test case validates that when owner calls isPaused t returns false the first time.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to check if Paused from owner", function() {
                    return owned.isPaused({ from: owner1 })
                    .then(owner => assert.strictEqual(owner, false));
                });

            });

            describe("setPaused", function() {
                /*
	            *This test case validates if exception is thrown while trying to set paused variable from wrong owner.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set paused variable if asking from wrong owner", function() {
                    return owned.setPaused(true, { from: owner1, gas: 3000000})
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case validates if exception is thrown while trying to set paused variable when there is no change in existing state.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set paused variable from owner if no change", function() {
                    return owned.setPaused(false, { from: owner0, gas: 3000000})
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case checks if the paused variable is set correctly.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to set paused variable by correct owner", function() {
                    return owned.setPaused(true, { from: owner0, gas: 3000000 })
                    .then(tx => {
                    const logChanged = tx.logs[0];
                    assert.strictEqual(logChanged.event, "LogPausedSet");
                    assert.strictEqual(logChanged.args.owner, owner0);
                    assert.strictEqual(logChanged.args.state, true);
                    return owned.isPaused();
                    })
                    .then(owner => assert.strictEqual(owner, true));
                });

            });

            describe("reset paused variable", function() {

                beforeEach("should set paused variable once", function() {
                    return owned.setPaused(true, { from: owner0 });
                });

                /*
	            *This test case validates if exception is thrown while trying to set paused variable from wrong owner.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should not be possible to set paused variable if asking from wrong owner", function() {
                    return owned.setPaused(false, { from: owner1, gas: 3000000 })
                    .catch(function(error) {
                    assert.notEqual(error, undefined, 'Exception thrown');
                    assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Error: VM Exception while processing transaction: revert');
                    });
                });

                /*
	            *This test case checks if the paused variable is reset again correctly.
	            *The test case was written to check if the implicit requirement was executed correctly.
                */

                it("should be possible to set paused variable again from correct owner", function() {
                    return owned.setPaused.call(false, { from: owner0 })
                        .then(success => assert.isTrue(success))
                        .then(() => owned.setPaused(false, { from: owner0 }))
                        .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 1);
                            assert.strictEqual(tx.logs.length, 1);
                            const logChanged = tx.logs[0];
                            assert.strictEqual(logChanged.event, "LogPausedSet");
                            assert.strictEqual(logChanged.args.owner, owner0);
                            assert.strictEqual(logChanged.args.state, false);
                            return owned.isPaused();
                        })
                        .then(owner => assert.strictEqual(owner, false));
                });

            });

        });

    });

});
