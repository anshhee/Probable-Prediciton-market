/**
 * Frontend type definitions for ProbableMarket data.
 *
 * The on-chain `markets(uint256)` mapping returns:
 *   endTime      uint64   — Unix timestamp (seconds) when the market closes
 *   state        uint8    — 0 = Active, 1 = Resolved, 2 = Cancelled
 *   oracle       address  — Account authorised to resolve the market
 *   yesShares    uint256  — Total YES shares outstanding
 *   noShares     uint256  — Total NO shares outstanding
 *   questionHash bytes32  — keccak256 of the question string (stored off-chain)
 *
 * NOTE: The question string is NOT stored on-chain. Only its keccak256 hash
 * is stored for integrity verification. A question field is included here
 * for future off-chain enrichment (e.g. from an indexer or IPFS).
 */

/** Mirrors the MarketState enum in ProbableMarket.sol */
export enum MarketState {
  Active    = 0,
  Resolved  = 1,
  Cancelled = 2,
}

/** Maps a raw uint8 to the MarketState enum; falls back to Active for unknown values. */
export function toMarketState(raw: number): MarketState {
  if (raw === 1) return MarketState.Resolved;
  if (raw === 2) return MarketState.Cancelled;
  return MarketState.Active;
}

/**
 * Strongly-typed frontend representation of a single prediction market.
 * All bigint fields match their Solidity counterparts directly.
 */
export interface Market {
  /** 0-based index used to address the market on-chain */
  id: bigint;

  /** Unix timestamp (seconds) when this market closes for trading */
  endTime: bigint;

  /** Current lifecycle state of the market */
  state: MarketState;

  /** Address of the account authorised to resolve this market */
  oracle: `0x${string}`;

  /** Total YES shares outstanding (raw wei-like units) */
  yesShares: bigint;

  /** Total NO shares outstanding (raw wei-like units) */
  noShares: bigint;

  /**
   * keccak256 hash of the question string.
   * Use to verify off-chain question text once an indexer is available.
   */
  questionHash: `0x${string}`;

  /**
   * Human-readable question text.
   * Undefined until enriched from an off-chain source; display a fallback
   * (e.g. "Market #<id>") when absent.
   */
  question?: string;
}
