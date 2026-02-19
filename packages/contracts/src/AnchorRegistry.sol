// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AnchorRegistry {
    error ZeroHash();
    error AlreadyAnchored(bytes32 stepKey);

    event Anchored(
        bytes32 indexed dataHash,
        bytes32 indexed stepKey,
        address indexed actor,
        uint256 timestamp
    );

    mapping(bytes32 => bool) public anchoredStepKeys;

    function anchorStep(bytes32 dataHash, bytes32 stepKey) external {
        if (dataHash == bytes32(0) || stepKey == bytes32(0)) {
            revert ZeroHash();
        }
        if (anchoredStepKeys[stepKey]) {
            revert AlreadyAnchored(stepKey);
        }

        anchoredStepKeys[stepKey] = true;
        emit Anchored(dataHash, stepKey, msg.sender, block.timestamp);
    }
}
