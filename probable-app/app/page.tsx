'use client';

import ConnectWallet from './components/ConnectWallet';
import MarketCard from './components/market/MarketCard';
import { useMarkets } from '@/hooks/useMarkets';
import styles from './page.module.css';

export default function Home() {
  const { markets, isLoading, error } = useMarkets();

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Probable</h1>
        <p className={styles.subtitle}>Connected to Ethereum Sepolia</p>

        <ConnectWallet />

        {/* ── Market list section ───────────────────────────────────────── */}
        <section className={styles.marketsSection}>
          <p className={styles.marketCount}>
            {isLoading
              ? 'Loading markets…'
              : `Markets Created: ${markets.length}`}
          </p>

          {error && (
            <p className={styles.errorMsg}>Failed to load markets.</p>
          )}

          {!isLoading && !error && markets.length === 0 && (
            <p className={styles.emptyMsg}>No markets have been created yet.</p>
          )}

          {markets.length > 0 && (
            <ul className={styles.marketList}>
              {markets.map((market) => (
                <li key={market.id.toString()}>
                  <MarketCard market={market} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
