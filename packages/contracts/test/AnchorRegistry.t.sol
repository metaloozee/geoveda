// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AnchorRegistry.sol";

contract AnchorRegistryTest is Test {
    AnchorRegistry internal registry;

    event Anchored(
        bytes32 indexed dataHash,
        bytes32 indexed stepKey,
        address indexed actor,
        uint256 timestamp
    );

    function setUp() public {
        registry = new AnchorRegistry();
    }

    function test_anchorStep_emitsAnchoredEvent() public {
        bytes32 dataHash = keccak256("data");
        bytes32 stepKey = keccak256("step-1");

        vm.expectEmit(true, true, true, false);
        emit Anchored(dataHash, stepKey, address(this), 0);

        registry.anchorStep(dataHash, stepKey);
        assertTrue(registry.anchoredStepKeys(stepKey));
    }

    function test_anchorStep_revertsOnZeroHash() public {
        bytes32 stepKey = keccak256("step-1");
        vm.expectRevert(AnchorRegistry.ZeroHash.selector);
        registry.anchorStep(bytes32(0), stepKey);
    }

    function test_anchorStep_revertsOnZeroStepKey() public {
        bytes32 dataHash = keccak256("data");

        vm.expectRevert(AnchorRegistry.ZeroHash.selector);
        registry.anchorStep(dataHash, bytes32(0));
    }

    function test_anchorStep_revertsOnDuplicateStepKey() public {
        bytes32 dataHash = keccak256("data");
        bytes32 stepKey = keccak256("step-1");

        registry.anchorStep(dataHash, stepKey);

        vm.expectRevert(
            abi.encodeWithSelector(AnchorRegistry.AlreadyAnchored.selector, stepKey)
        );
        registry.anchorStep(dataHash, stepKey);
    }
}
