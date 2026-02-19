import type { Abi } from "viem";

export const anchorRegistryAbi = [
  {
    type: "event",
    name: "Anchored",
    inputs: [
      {
        indexed: true,
        name: "dataHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        indexed: true,
        name: "stepKey",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        indexed: true,
        name: "actor",
        type: "address",
        internalType: "address",
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "anchorStep",
    inputs: [
      {
        name: "dataHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "stepKey",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;
