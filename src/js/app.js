 App = {

  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } 
    else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Admin.json').then(function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdminArtifact = data;
      App.contracts.Admin = TruffleContract(AdminArtifact);
      // Set the provider for our contract
      App.contracts.Admin.setProvider(App.web3Provider);
      return $.getJSON('StoreOwnerFactory.json');
      }).then (function (data) {
        var StoreOwnerFactoryArtifact = data;
        App.contracts.StoreOwnerFactory = TruffleContract(StoreOwnerFactoryArtifact);
        App.contracts.StoreOwnerFactory.setProvider(App.web3Provider);
        return $.getJSON('StoreOwner.json');
        }).then(function(data) {
          var StoreOwnerArtifact = data;
          App.contracts.StoreOwner = TruffleContract(StoreOwnerArtifact);
          App.contracts.StoreOwner.setProvider(App.web3Provider);
          return $.getJSON('StoreFront.json');
          }).then(function(data) {
            var StoreFrontArtifact = data;
            App.contracts.StoreFront = TruffleContract(StoreFrontArtifact);
            App.contracts.StoreFront.setProvider(App.web3Provider);
          
            var account = null;
            var accountInterval = setInterval(function() {
              if (web3.eth.accounts[0] !== account) {
                account = web3.eth.accounts[0];
                App.initIndex();
                
                let url = window.location.href
                if(url.includes("admin"))
                  App.initAdmin();
                else if(url.includes("storeowner"))
                  App.initSO();
                else if(url.includes("storefront"))
                  App.initSF();
              }
            }, 100);
   });

   //console.log("done all");
 },

  initAdmin : function() {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var elem = document.getElementById("btnPauseAdmin");

      App.contracts.Admin.deployed().then(function(instance) {
        return instance.isPaused.call(); 
        }).then(function(r) {
        console.log(r);
        if(r){
          elem.innerHTML = "RESTART ADMIN"
        }
        else {
          elem.innerHTML = "STOP ADMIN"
        }
      });
    });
 },

  initSO : function() {

    var url = new URL(window.location.href);
    var so_addr = url.searchParams.get("address");
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      

      var storeOwnerInstance;
      var account = accounts[0];
      var elem = document.getElementById("btnPauseStoreOwner");

      App.contracts.StoreOwner.at(so_addr).then(function(instance) {
        return instance.isPaused.call(); 
        }).then(function(r) {
        if(r==true){
          elem.innerHTML = "RESTART STOREOWNER"
        }
        else {
          elem.innerHTML = "STOP STOREOWNER"
        }
      });
    });
  },

  initSF : function() {

    var url = new URL(window.location.href);
    var sf_addr = url.searchParams.get("address");
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var elem = document.getElementById("btnPauseStoreFront");

      App.contracts.StoreFront.at(sf_addr).then(function(instance) {
        return instance.isPaused.call(); 
        }).then(function(r) {
        if(r==true){
          elem.innerHTML = "RESTART STOREFRONT"
        }
        else {
          elem.innerHTML = "STOP STOREFRONT"
        }
      });
    });
  },

  setStoreOwner: function() {
    var self =this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
      var addr = document.getElementById("so_add").value.toLowerCase();
      if(App.isAddress(addr) && addr != 0)
      {
      console.log("isAddress:"+App.isAddress(addr));
      statusSetSO.innerHTML = "";
      var adminInstance;

      console.log("Input Address:"+addr);

      App.contracts.Admin.deployed().then(function(instance) {
        adminInstance = instance;
        return adminInstance.getOwner.call();
        }).then(function(owner){
        admin_owner = owner;
        console.log("admin owner: " + admin_owner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return adminInstance. addStoreOwner(addr, {from: account, gas:3000000}); 
        }).then(function(r) {
        //console.log("First log" + r.logs[0]["args"]["newOwner"]);
        var soAddress = r.logs[1]["args"]["storeownercontractaddress"];
        //console.log("Transaction Completed!!" +  soAddress);
        statusSetSO.innerHTML = "Transaction Completed!!";
        }).catch(function(err) {
        //console.log("Error: " + err.message);
        statusSetSO.innerHTML = "Error: " + err.message;
        });
      }
      else{
        statusSetSO.innerHTML ="Input address is not valid..Try again"
      }
      });
  },

  setAdmin: function() {
    var self =this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      
      var account = accounts[0];
      var addr = document.getElementById("admin_add").value.toLowerCase();
      var status = document.getElementById("statusSetAdmin").value;
      var adminInstance;
  
      console.log("Input Address:"+addr);
  
      App.contracts.Admin.deployed().then(function(instance) {
        adminInstance = instance;
        return adminInstance.getOwner.call();
        }).then(function(owner){
        admin_owner = owner;
        console.log("admin owner: " + admin_owner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return adminInstance. addAdmin(addr, {from: account, gas:3000000}); 
        }).then(function(r) {
        //var adminAddress = r.logs[1]["args"]["adminaddress"];
        //console.log("Transaction Completed!!" +  adminAddress);
        console.log("Transaction Completed!!");
        statusSetAdmin.innerHTML = "Transaction Completed!!";
        }).catch(function(err) {
        console.log("Error: " + err.message);
        statusSetAdmin.innerHTML = "Error: " + err.message;
        });
      });
  },

  initIndex: function() {
    var self = this;
    var typeSet = false;
    var isSO;
    var url = new URL(window.location.href);
    var storeFrontaddr = url.searchParams.get("address");
    var soContractAddr;
    var sfInstance;
    var sOwner;
    //console.log("storeFrontaddr:"+storeFrontaddr);
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      
      var addr = accounts[0];
      console.log("CA "+addr);
      
      if(storeFrontaddr != undefined && (window.location.href).includes("/storefront.html?address="+storeFrontaddr))
      {
        App.contracts.StoreFront.at(storeFrontaddr).then(function(instance) {
          sfInstance = instance;
          return sfInstance.getOwner.call();
        }).then(function(owner) {
          sOwner = owner;
          console.log("owner"+owner);
          console.log("addr"+addr);
          if(owner == addr)
          {
            
            (window.location.href).includes("/storefront.html?address="+storeFrontaddr);
          }
          else{
            App.contracts.Admin.deployed().then(function(instance) {
              adminInstance = instance;
              console.log("Instance Got");
              return adminInstance.admins.call(addr);
              }).then(function(result){
              if(result){
                App.isAdmin = result;
                console.log("admin");
                if(!((window.location.href).includes("/admin.html?address="+addr)))
                  window.location.href = "/admin.html?address="+addr;
                  typeSet = true;
                }
              }).then(function() {
              return adminInstance.storeowners.call(addr); 
              }).then(function(result) {
              if(result && !typeSet){
                console.log("SO");
                isSO = result;
                return adminInstance.storeownercontracts.call(addr);
              }
              }).then(function(address) {
              if(isSO && !typeSet){
                if(!((window.location.href).includes("/storeowner.html?address="+address)))
                  window.location.href = "/storeowner.html?address="+address;
                  typeSet = true;
                }
              }).then(function() {
              if(!typeSet){
                if(!((window.location.href).includes("/shopper")))
                    window.location.href = "/shopper.html";
                }
        
              }).catch(function(err) {
              console.log("Error: " + err.message);
              //statusGetType.innerHTML = "Error: " + err.message
              });
          }
        });
      }
  else{
    App.contracts.Admin.deployed().then(function(instance) {
      adminInstance = instance;
      console.log("Instance Got");
      return adminInstance.admins.call(addr);
      }).then(function(result){
      if(result){
        App.isAdmin = result;
        console.log("admin");
        if(!((window.location.href).includes("/admin.html?address="+addr)))
          window.location.href = "/admin.html?address="+addr;
          typeSet = true;
        }
      }).then(function() {
      return adminInstance.storeowners.call(addr); 
      }).then(function(result) {
      if(result && !typeSet){
        console.log("SO");
        isSO = result;
        return adminInstance.storeownercontracts.call(addr);
      }
      }).then(function(address) {
      if(isSO && !typeSet){
        //if((window.location.href).includes("/storefront.html?address="+owner_add))
        if(!((window.location.href).includes("/storeowner.html?address="+address)))
          window.location.href = "/storeowner.html?address="+address;
          typeSet = true;
        }
      }).then(function() {
      if(!typeSet){
        if(!((window.location.href).includes("/shopper")))
            window.location.href = "/shopper.html";
        }

      }).catch(function(err) {
      console.log("Error: " + err.message);
      //statusGetType.innerHTML = "Error: " + err.message
      });
    }
    });     
  },

  addStoreFront: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    var self =this; 
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      var status = document.getElementById("statusAddSF").value;
      var storeOwnerInstance;

      App.contracts.StoreOwner.at(contractAddress).then(function(instance) {
        storeOwnerInstance = instance;
        return storeOwnerInstance.getOwner.call();
        }).then(function(owner){
        storeOwner = owner;
        console.log("StoreOwner: " + storeOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeOwnerInstance.addStoreFront({from: account, gas:3000000}); 
        }).then(function(r) {
        var sfAddress = r.logs[1]["args"]["storefrontaddress"];
        console.log("Transaction Completed!!" +  sfAddress);
        statusAddSF.innerHTML = "Transaction Completed!!";

        }).catch(function(err) {
          console.log("Error: " + err.message);
        });
      });
  }, 

  removeStoreFront: function() {
    var self =this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      var addr = document.getElementById("sf_remove").value.toLowerCase(); 
      var status = document.getElementById("statusRemoveSF").value;
      var storeOwnerInstance;
      console.log("Input Address:"+addr);

      App.contracts.StoreOwner.at(contractAddress).then(function(instance) {
        storeOwnerInstance = instance;
        return storeOwnerInstance.getOwner.call();
        }).then(function(owner){
        storeOwner = owner;
        console.log("StoreOwner: " + storeOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeOwnerInstance.removeStoreFront(addr, {from: account, gas:3000000}); 
        }).then(function(r) {
        var sfAddress = r.logs[0]["args"]["storefrontaddress"];
        console.log("Transaction Completed!!" +  sfAddress);
        statusRemoveSF.innerHTML = "Transaction Completed!!";
  
        }).catch(function(err) {
        console.log("Error: " + err.message);
        });
      });
  }, 

  addProduct: function() {

    var self =this;
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
  
      var name = document.getElementById("prod_add_name").value;
      var price = document.getElementById("prod_add_price").value; 

      var quantity = document.getElementById("prod_add_qty").value;
      var status = document.getElementById("statusAddProduct").value;
      
      var storeFrontInstance;
      if(name == undefined || name == "" )
      {
        statusAddProduct.innerHTML = "Product name is empty. Please enter a valid name";
      }
      else if(price == undefined ||price <=0 )
      {
        statusAddProduct.innerHTML ="Product Price is invalid. Please enter a correct number";

      }
      else if(quantity == undefined ||quantity <=0)
      {
        statusAddProduct.innerHTML ="Product Quantity is invalid. Please enter a correct number";
      }
      else{
      
        statusAddProduct.innerHTML ="";
      App.contracts.StoreFront.at(contractAddress).then(function(instance) {
        storeFrontInstance = instance;
        return storeFrontInstance.getOwner.call();
        }).then(function(owner){
        storeFrontOwner = owner;
        console.log("StoreFrontOwner: " + storeFrontOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeFrontInstance.addProduct(name,price,quantity, {from: account, gas:3000000}); 
        }).then(function() {
        console.log("Product Added Successfully ");
        statusAddProduct.innerHTML = "Product Added Successfully";
        }).catch(function(err) {
        statusAddProduct.innerHTML = "Error:" + err.message;
        console.log("Error: " + err.message);
        });
       }
      });
  },

  buyProduct: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    var self = this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
        
      var account = accounts[0];
      var prodId = document.getElementById("prod_buy_pid").value; 
      var quantity = document.getElementById("prod_buy_qty").value;
      var status = document.getElementById("statusBuyProduct").value;
      var storeFrontInstance;

      if(prodId == undefined ||prodId <=0 )
      {
        statusBuyProduct.innerHTML ="Product ID is invalid. Please enter a correct number";

      }
      else if(quantity == undefined ||quantity <=0)
      {
        statusBuyProduct.innerHTML ="Product Quantity is invalid. Please enter a correct number";
      }
      else{
        statusBuyProduct.innerHTML = "";
      App.contracts.StoreFront.at(contractAddress).then(function(instance) {
        storeFrontInstance = instance;
        return storeFrontInstance.getOwner.call();
        }).then(function(owner){
        storeFrontOwner = owner;
        console.log("StoreFrontOwner: " + storeFrontOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeFrontInstance.buyProduct(prodId,quantity, {from: account, value: web3.toWei("10.0","ether"),gas:3000000}); 
        }).then(function() {
        console.log("Product Bought Successfully ");
        statusBuyProduct.innerHTML = "Product Bought Successfully";
        }).catch(function(err) {
        statusBuyProduct.innerHTML = "Error:" + err.message;
        console.log("Error: " + err.message);
        });
      }
      });
  },


  removeProduct: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
 
    var self = this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
          
      var account = accounts[0];
      var prodId = document.getElementById("prod_remove_pid").value; 
      var status = document.getElementById("statusRemoveProduct").value;
      var storeFrontInstance;

      if(prodId == undefined ||prodId <=0 )
      {
        statusRemoveProduct.innerHTML ="Product ID is invalid. Please enter a correct number";

      }
      else{
        statusRemoveProduct.innerHTML = "";
      App.contracts.StoreFront.at(contractAddress).then(function(instance) {
        storeFrontInstance = instance;
        return storeFrontInstance.getOwner.call();
        }).then(function(owner){
        storeFrontOwner = owner;
        console.log("StoreFrontOwner: " + storeFrontOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeFrontInstance.removeProduct(prodId, {from: account, gas:3000000}); 
        }).then(function() {
        console.log("Product Removed Successfully");
        statusRemoveProduct.innerHTML = "Product Removed Successfully";
        
        }).catch(function(err) {
        console.log("Error: " + err.message);
        statusRemoveProduct.innerHTML = "Error:" + err.message;
        });
      }
      });
  },

  changePrice: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");

    var self =this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
        
      var account = accounts[0];
      var newPrice = document.getElementById("prod_modify_price").value; 
      var prodId = document.getElementById("prod_modify_pid").value;
      var status = document.getElementById("statusChangePrice").value;
      var storeFrontInstance;

      if(prodId == undefined ||prodId <=0 )
      {
        statusChangePrice.innerHTML ="Product ID is invalid. Please enter a correct number";

      }
      else if(newPrice == undefined ||newPrice <=0)
      {
        statusChangePrice.innerHTML ="Product price is invalid. Please enter a correct number";
      }
      else{

      statusChangePrice.innerHTML = "";
      App.contracts.StoreFront.at(contractAddress).then(function(instance) {
        storeFrontInstance = instance;
        return storeFrontInstance.getOwner.call();
        }).then(function(owner){
        storeFrontOwner = owner;
        console.log("StoreFrontOwner: " + storeFrontOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeFrontInstance.changePrice(prodId, newPrice, {from: account, gas:3000000}); 
        }).then(function() {
        console.log("Price Changed Successfully");
        statusChangePrice.innerHTML = "Price Changed Successfully";
    
        }).catch(function(err) {
        console.log("Error: " + err.message);
        statusChangePrice.innerHTML = "Error:" + err.message;
        });
      }
      });
  },

  seeAllProducts: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    var storeFrontInstance;
    var self = this;
    var owner;
    var status = document.getElementById("statusAllProd").value;
    statusAllProd.innerHTML = "Initiating transaction... (please wait)";

    var toPrint = '<table style="width:100%, align:center"><tr><th>Product ID</th><th>&nbspProduct Name</th><th>&nbspPrice</th><th>&nbspQuantity</th></tr>'

    App.contracts.StoreFront.at(contractAddress).then(function(instance) {
      storeFrontInstance = instance;
      return storeFrontInstance.getOwner.call();
      }).then(function(owner){
      let addProductEvent = storeFrontInstance.AddedProduct({sfowner : owner},{fromBlock: 0, toBlock: 'latest'})
      addProductEvent.get(function(err, result) {
        //console.log("addproduct "+JSON.stringify(result));
        for(i=0; i<result.length; i++){
          let currId = result[i]["args"]["productid"]
          storeFrontInstance.products.call(currId)
          .then(function(r){
            if(r[0] == true) {
              toPrint += '<tr><td>'+ currId + '</td><td>&nbsp' +
              web3.toAscii(r[2]) + '</td><td>&nbsp' + 
              r[3] + '</td><td>&nbsp' + 
              r[4] + '</td><td></tr>';
            }
            //console.log(toPrint);
            statusAllProd.innerHTML = toPrint + '</table>';
          });

        }
        
      })
      
    });

  },  

  seeAllStoresByOwner: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    var storeOwnerInstance;
    var self = this;
    var status = document.getElementById("statusAllStores").value;
    statusAllStores.innerHTML = "Initiating transaction... (please wait)";
      
    var toPrint = '<table style="width:100%, align:center"><tr><th>Store Address</th></tr>'
    App.contracts.StoreOwner.at(contractAddress).then(function(instance) {
      storeOwnerInstance = instance;
      return storeOwnerInstance.getOwner.call();
      }).then(function(owner){
        let addStoreFrontEvent = storeOwnerInstance.AddedStoreFront({storeowneraddress: owner},{fromBlock: 0, toBlock: 'latest'})
        addStoreFrontEvent.get(function(err, result) {
          for(i=0; i<result.length;i++){
            toPrint += '<tr><td><a href=\'/storefront.html?address='+ result[i]["args"]["storefrontaddress"]+'\'>'+result[i]["args"]["storefrontaddress"]+'</a></td></tr>';
          }
          statusAllStores.innerHTML = toPrint + '</table>';
        })
      });
  },  

  seeAllStores: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");
    //alert(contractAddress);

    var self = this;
    var status = document.getElementById("statusAllStores").value;
    statusAllStores.innerHTML = "Initiating transaction... (please wait)";
    
    var storeownerfactoryinstance;
    var storeOwnerInstance;

    var toPrint = '<table style="width:100%, align:center"><tr><th>Store Address</th></tr>'
    App.contracts.StoreOwnerFactory.deployed().then(function(instance) {
      storeownerfactoryinstance = instance;
      return storeownerfactoryinstance.getSOContractCount.call();
      }).then(function(count) {
      console.log("count is:" + count);

      let f = function(i) {
        storeownerfactoryinstance.storeownercontracts.call(i)
          .then(function(so_address) {
          App.contracts.StoreOwner.at(so_address).then(function(instance) {
            storeOwnerInstance = instance;
            return storeOwnerInstance.getOwner.call();
            }).then(function(owner){
            let addStoreFrontEvent = storeOwnerInstance.AddedStoreFront({storeowneraddress: owner},{fromBlock: 0, toBlock: 'latest'})
            addStoreFrontEvent.get(function(err, result) {
            console.log(so_address + "," + owner + "," + result.length);
            for(i=0; i<result.length;i++){
              //console.log("Address is: "+ result[i]["args"]["storefrontaddress"])
              toPrint += '<tr><td><a href=\'/shopper1.html?address='+ result[i]["args"]["storefrontaddress"]+'\'>'+result[i]["args"]["storefrontaddress"]+'</a></td></tr>';
              //console.log(toPrint);
              //statusAllStores.innerHTML += toPrint;
            }
            statusAllStores.innerHTML = toPrint + '</table>'
          });
          });
          });
          
      }


      for(let i=0; i<count; i++) {
        f(i)
      }
    });
        
  },

  withdrawBalance: function() {
    var url = new URL(window.location.href);
    var contractAddress = url.searchParams.get("address");

    var self =this;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
        
      var account = accounts[0];
      var status = document.getElementById("statusWithdrawBalance").value;
      var storeFrontInstance;

      App.contracts.StoreFront.at(contractAddress).then(function(instance) {
        storeFrontInstance = instance;
        return storeFrontInstance.getOwner.call();
        }).then(function(owner){
        storeFrontOwner = owner;
        console.log("StoreFrontOwner: " + storeFrontOwner);
        console.log("Current account selected: "+ account);
        }).then(function() {
        return storeFrontInstance.withdraw({from: account, gas:3000000}); 
        }).then(function() {
        console.log("Balance Withdraw Successful");
        statusWithdrawBalance.innerHTML = "Balance Withdraw Successful";
    
        }).catch(function(err) {
        console.log("Error: " + err.message);
        statusWithdrawBalance.innerHTML = "Error:" + err.message;
        });
      });
  },

  pauseAdmin : function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
    var account = accounts[0];

    var elem = document.getElementById("btnPauseAdmin");
    if (elem.innerHTML == "Loading...")
      return 

    var r = confirm("Are you sure you want to do this?");
    if (r == true) {
        // Owner confirmed he wants to do this
        
        if (elem.innerHTML=="STOP ADMIN") {
          App.contracts.Admin.deployed().then(function(instance) {
            adminInstance = instance;
            return adminInstance.setPaused(true,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseAdmin.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "RESTART ADMIN";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseAdmin.innerHTML = "Error: " + err.message;
          });
          
        }
        else {
          App.contracts.Admin.deployed().then(function(instance) {
            adminInstance = instance;
            return adminInstance.setPaused(false,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseAdmin.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "STOP ADMIN";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseAdmin.innerHTML = "Error: " + err.message;
          });
          
        }
    }
  });
  },

  pauseSO : function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
    var url = new URL(window.location.href);
    var so_addr = url.searchParams.get("address");

    var account = accounts[0];

    var elem = document.getElementById("btnPauseStoreOwner");
    if (elem.innerHTML == "Loading...")
      return 

    var r = confirm("Are you sure you want to do this?");
    if (r == true) {
        // Owner confirmed he wants to do this
        if (elem.innerHTML=="STOP STOREOWNER") {
          App.contracts.StoreOwner.at(so_addr).then(function(instance) {
            return instance.setPaused(true,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseSO.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "RESTART STOREOWNER";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseSO.innerHTML = "Error: " + err.message;
          });
          
        }
        else {
          App.contracts.StoreOwner.at(so_addr).then(function(instance) {
            return instance.setPaused(false,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseSO.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "STOP STOREOWNER";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseSO.innerHTML = "Error: " + err.message;
          });
          
        }
    }
  });
  },

  pauseSF : function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
    var url = new URL(window.location.href);
    var sf_addr = url.searchParams.get("address");

    var account = accounts[0];

    var elem = document.getElementById("btnPauseStoreFront");
    if (elem.innerHTML == "Loading..."){
      console.log("inner html is still loading...")
      return 
    }

    var r = confirm("Are you sure you want to do this?");
    if (r == true) {
        // Owner confirmed he wants to do this
        if (elem.innerHTML=="STOP STOREFRONT") {
          App.contracts.StoreFront.at(sf_addr).then(function(instance) {
            return instance.setPaused(true,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseSF.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "RESTART STOREFRONT";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseSF.innerHTML = "Error: " + err.message;
          });
          
        }
        else {
          App.contracts.StoreFront.at(sf_addr).then(function(instance) {
            return instance.setPaused(false,{from: account, gas:3000000}); 
            }).then(function(r) {
            var currState = r.logs[0]["args"]["state"];
            console.log("Transaction Completed!!" +  currState);
            statusPauseSF.innerHTML = "Transaction Completed!!";
            elem.innerHTML = "STOP STOREFRONT";
            }).catch(function(err) {
            console.log("Error: " + err.message);
            statusPauseSF.innerHTML = "Error: " + err.message;
          });
          
        }
      }
    });
  },

   isAddress: function (address) {
    // function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return App.isChecksumAddress(address);
    }
},


 isChecksumAddress : function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
}

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});