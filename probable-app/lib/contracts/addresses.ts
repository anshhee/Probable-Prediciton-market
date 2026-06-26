/**
 * Deployed contract addresses, keyed by chain ID.
 *
 * Chain IDs:
 *   11155111 — Ethereum Sepolia testnet
 *
 * Add new entries here as the contract is deployed to additional networks.
 */
export const CHAIN_IDS = {
  SEPOLIA: 11155111,
} as const;

export const CONTRACT_ADDRESSES = {
  probableMarket: {
    [CHAIN_IDS.SEPOLIA]:
      "0xf2f1E2cE46879b89573a6F1592Be522D6bb929ba",
  },
} as const;