'use client';

import { useMarketCount } from '@/hooks/useMarketCount';
import styles from './MarketCount.module.css';

/**
 * Displays the live marketCount() value read from the ProbableMarket
 * contract on Ethereum Sepolia.
 */
export default function MarketCount() {
  const { count, isLoading, isError } = useMarketCount();

  const renderCount = () => {
    if (isLoading) return <span className={styles.loading}>Loading…</span>;
    if (isError)   return <span className={styles.error}>Error fetching data</span>;
    return <span className={styles.count}>{count?.toString() ?? '0'}</span>;
  };

  return (
    <div className={styles.card}>
      <p className={styles.label}>Markets Created</p>
      {renderCount()}
    </div>
  );
}
