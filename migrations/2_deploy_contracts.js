var SpeedCheckers = artifacts.require("SpeedCheckers");

module.exports = function(deployer) {
  deployer.deploy(SpeedCheckers);
};
