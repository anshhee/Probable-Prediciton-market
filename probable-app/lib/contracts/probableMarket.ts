/**
 * Reusable contract configuration for ProbableMarket.
 *
 * Combines the ABI and the deployed Sepolia address into a single object
 * that can be spread directly into wagmi hooks:
 *
 *   useReadContract({ ...probableMarketConfig, functionName: 'marketCount' })
 */
import { PROBABLE_MARKET_ABI } from "./abi";
import { CONTRACT_ADDRESSES, CHAIN_IDS } from "./addresses";

export const probableMarketConfig = {
    address: CONTRACT_ADDRESSES.probableMarket[CHAIN_IDS.SEPOLIA],
    abi: PROBABLE_MARKET_ABI,
} as const;

export type ProbableMarketAddress =
    (typeof CONTRACT_ADDRESSES.probableMarket)[typeof CHAIN_IDS.SEPOLIA];