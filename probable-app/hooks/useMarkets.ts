'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { probableMarketConfig } from '@/lib/contracts';
import { Market, toMarketState } from '@/types/market';

/**
 * Fetches all markets from the deployed ProbableMarket contract.
 *
 * Strategy:
 *   1. Read `marketCount()` to learn how many markets exist.
 *   2. Fan-out a `useReadContracts` call with one `markets(i)` call per index.
 *   3. Normalize the raw tuple results into typed `Market` objects.
 *
 * Returns:
 *   - `markets`   — array of fully-typed Market objects (empty while loading)
 *   - `isLoading` — true while either the count or any market fetch is in-flight
 *   - `error`     — first error encountered, if any
 *   - `refetch`   — manually re-trigger all reads (e.g. after a write)
 */
export function useMarkets(): {
  markets: Market[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  // ── Step 1: read how many markets exist ────────────────────────────────────
  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
    refetch: refetchCount,
  } = useReadContract({
    ...probableMarketConfig,
    functionName: 'marketCount',
  });

  const count = typeof countData === 'bigint' ? Number(countData) : 0;

  // ── Step 2: build one contract call per market index ───────────────────────
  const contracts = Array.from({ length: count }, (_, i) => ({
    ...probableMarketConfig,
    functionName: 'markets' as const,
    args: [BigInt(i)] as const,
  }));

  const {
    data: marketsRaw,
    isLoading: isMarketsLoading,
    error: marketsError,
    refetch: refetchMarkets,
  } = useReadContracts({
    contracts,
    // Only run after we know the count
    query: { enabled: count > 0 },
  });

  // ── Step 3: normalize raw tuples → typed Market objects ───────────────────
  const markets: Market[] = [];

  if (marketsRaw) {
    for (let i = 0; i < marketsRaw.length; i++) {
      const result = marketsRaw[i];

      // Skip any call that errored or returned nothing
      if (result.status !== 'success' || !result.result) continue;

      // The ABI returns a tuple: [endTime, state, oracle, yesShares, noShares, questionHash]
      const [endTime, state, oracle, yesShares, noShares, questionHash] =
        result.result as [bigint, number, `0x${string}`, bigint, bigint, `0x${string}`];

      markets.push({
        id:           BigInt(i),
        endTime,
        state:        toMarketState(Number(state)),
        oracle,
        yesShares,
        noShares,
        questionHash,
      });
    }
  }

  // ── Combine loading / error state ──────────────────────────────────────────
  const isLoading = isCountLoading || (count > 0 && isMarketsLoading);

  const error: Error | null =
    countError
      ? new Error(countError.message)
      : marketsError
      ? new Error(marketsError.message)
      : null;

  function refetch() {
    refetchCount();
    refetchMarkets();
  }

  return { markets, isLoading, error, refetch };
}
