// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/AnchorRegistry.sol";

contract DeployAnchorRegistry is Script {
  function run() external returns (AnchorRegistry deployed) {
    uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    deployed = new AnchorRegistry();
    vm.stopBroadcast();
  }
}
