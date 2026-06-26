'use client';

import { useReadContract } from 'wagmi';
import { probableMarketConfig } from '@/lib/contracts';

/**
 * Reads the `marketCount()` view function from the deployed ProbableMarket
 * contract on Ethereum Sepolia.
 *
 * Returns:
 *   - `count`     — the current market count as a bigint (or undefined while loading)
 *   - `isLoading` — true while the RPC call is in-flight
 *   - `isError`   — true if the call failed
 *   - `error`     — the raw error object, if any
 */
export function useMarketCount() {
  const { data, isLoading, isError, error } = useReadContract({
    ...probableMarketConfig,
    functionName: 'marketCount',
  });

  return {
    count: data,       // bigint | undefined
    isLoading,
    isError,
    error,
  };
}
