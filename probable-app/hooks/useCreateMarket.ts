'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { probableMarketConfig } from '@/lib/contracts';

/**
 * Wraps the `createMarket(question, endTime, oracle)` write function on the
 * ProbableMarket contract.
 *
 * Returns:
 *   - `createMarket(question, endTime, oracle)` — sends the transaction
 *   - `isPending`    — true while the wallet is waiting for user signature
 *   - `isConfirming` — true while the transaction is mining on-chain
 *   - `isSuccess`    — true once the transaction is confirmed
 *   - `error`        — first error encountered (write or receipt), if any
 */
export function useCreateMarket() {
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

  function createMarket(question: string, endTime: bigint, oracle: `0x${string}`) {
    writeContract({
      ...probableMarketConfig,
      functionName: 'createMarket',
      args: [question, endTime, oracle],
    });
  }

  const error: Error | null =
    writeError
      ? new Error(writeError.message)
      : receiptError
      ? new Error(receiptError.message)
      : null;

  return {
    createMarket,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
