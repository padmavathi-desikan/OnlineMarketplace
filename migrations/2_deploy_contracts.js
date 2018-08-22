var Owned = artifacts.require("./Owned.sol");
var Pausable = artifacts.require("./Pausable.sol");
var Admin = artifacts.require("./Admin.sol");
var StoreOwnerFactory = artifacts.require("./StoreOwnerFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned).then(function() {
    return deployer.deploy(Pausable)
    .then(function(){
      return deployer.deploy(StoreOwnerFactory)
      .then(function(){
        return deployer.deploy(Admin, StoreOwnerFactory.address);
      });
    });
  });
};
