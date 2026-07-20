'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { probableMarketConfig } from '@/lib/contracts';

/**
 * Wraps the `buyShares(marketId, isYes)` payable write function on the
 * ProbableMarket contract.
 *
 * Returns:
 *   - `buyShares(marketId, isYes, amountEth)` — sends the transaction with ETH value
 *   - `isPending`    — true while the wallet is waiting for user signature
 *   - `isConfirming` — true while the transaction is mining on-chain
 *   - `isSuccess`    — true once the transaction is confirmed
 *   - `error`        — first error encountered (write or receipt), if any
 *   - `reset`        — clears the write state
 */
export function useBuyShares() {
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function buyShares(marketId: bigint, isYes: boolean, amountEth: string) {
    writeContract({
      ...probableMarketConfig,
      functionName: 'buyShares',
      args: [marketId, isYes],
      value: parseEther(amountEth),
    });
  }

  const error: Error | null =
    writeError
      ? new Error(writeError.message)
      : receiptError
      ? new Error(receiptError.message)
      : null;

  return {
    buyShares,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
