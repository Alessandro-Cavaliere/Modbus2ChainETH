const IoTDataNotarization = artifacts.require("IoTDataNotarization");

module.exports = function (deployer) {
  deployer.deploy(IoTDataNotarization);
};
