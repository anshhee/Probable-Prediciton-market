/**
 * ABI for the ProbableMarket smart contract.
 * Sourced from the Hardhat artifact at:
 *   artifacts/contracts/ProbableMarket.sol/ProbableMarket.json
 *
 * Using `as const` ensures wagmi / viem can infer exact types
 * from the ABI entries (no widening to `string`).
 */
export const PROBABLE_MARKET_ABI = [
  // ── Custom Errors ────────────────────────────────────────────────────────────
  { inputs: [], name: 'InvalidEndTime',    type: 'error' },
  { inputs: [], name: 'InvalidMarket',     type: 'error' },
  { inputs: [], name: 'InvalidValue',      type: 'error' },
  { inputs: [], name: 'MarketExpired',     type: 'error' },
  { inputs: [], name: 'MarketNotActive',   type: 'error' },
  { inputs: [], name: 'MarketNotExpired',  type: 'error' },
  { inputs: [], name: 'MarketNotResolved', type: 'error' },
  { inputs: [], name: 'NoWinningShares',   type: 'error' },
  { inputs: [], name: 'NotOracle',         type: 'error' },
  { inputs: [], name: 'TransferFailed',    type: 'error' },

  // ── Events ───────────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'uint256', name: 'marketId',  type: 'uint256' },
      { indexed: true,  internalType: 'address', name: 'creator',   type: 'address' },
      { indexed: true,  internalType: 'address', name: 'oracle',    type: 'address' },
      { indexed: false, internalType: 'string',  name: 'question',  type: 'string'  },
      { indexed: false, internalType: 'uint64',  name: 'endTime',   type: 'uint64'  },
    ],
    name: 'MarketCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { indexed: true,  internalType: 'address', name: 'oracle',   type: 'address' },
      { indexed: false, internalType: 'bool',    name: 'outcome',  type: 'bool'    },
    ],
    name: 'MarketResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { indexed: true,  internalType: 'address', name: 'user',     type: 'address' },
      { indexed: false, internalType: 'bool',    name: 'isYes',    type: 'bool'    },
      { indexed: false, internalType: 'uint256', name: 'amount',   type: 'uint256' },
      { indexed: false, internalType: 'bool',    name: 'isBuy',    type: 'bool'    },
    ],
    name: 'SharesTraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { indexed: true,  internalType: 'address', name: 'user',     type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount',   type: 'uint256' },
    ],
    name: 'WinningsClaimed',
    type: 'event',
  },

  // ── Write Functions ───────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { internalType: 'bool',    name: 'isYes',    type: 'bool'    },
    ],
    name: 'buyShares',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    name: 'cancelMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'marketId', type: 'uint256' }],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string',  name: 'question', type: 'string'  },
      { internalType: 'uint64',  name: 'endTime',  type: 'uint64'  },
      { internalType: 'address', name: 'oracle',   type: 'address' },
    ],
    name: 'createMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'marketId', type: 'uint256' },
      { internalType: 'bool',    name: 'outcome',  type: 'bool'    },
    ],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ── View / Pure Functions ─────────────────────────────────────────────────────
  {
    inputs: [],
    name: 'marketCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'markets',
    outputs: [
      { internalType: 'uint64',                        name: 'endTime',      type: 'uint64'  },
      { internalType: 'enum ProbableMarket.MarketState', name: 'state',       type: 'uint8'   },
      { internalType: 'address',                        name: 'oracle',       type: 'address' },
      { internalType: 'uint256',                        name: 'yesShares',    type: 'uint256' },
      { internalType: 'uint256',                        name: 'noShares',     type: 'uint256' },
      { internalType: 'bytes32',                        name: 'questionHash', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bool',    name: '', type: 'bool'    },
    ],
    name: 'userShares',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
