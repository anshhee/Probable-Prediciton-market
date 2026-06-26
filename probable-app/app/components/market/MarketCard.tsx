import { Market, MarketState } from '@/types/market';
import styles from './MarketCard.module.css';

interface MarketCardProps {
  market: Market;
}

/** Returns a human-readable label for a market state. */
function stateLabel(state: MarketState): string {
  switch (state) {
    case MarketState.Active: return 'Active';
    case MarketState.Resolved: return 'Resolved';
    case MarketState.Cancelled: return 'Cancelled';
  }
}

/** Formats a Unix timestamp (seconds as bigint) to a readable date string. */
function formatEndTime(endTime: bigint): string {
  const ms = Number(endTime) * 1000;
  if (ms === 0) return '—';
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** Formats a raw share count (bigint) to a compact decimal string. */
function formatShares(raw: bigint): string {
  if (raw === BigInt(0)) return '0';
  // Shares are stored as plain integers (not wei), so display as-is
  return raw.toLocaleString();
}

/**
 * Presentational card for a single prediction market.
 * Receives a fully-typed Market object — performs NO blockchain reads.
 */
export default function MarketCard({ market }: MarketCardProps) {
  const totalShares = market.yesShares + market.noShares;

  const yesPct =
    totalShares > BigInt(0)
      ? Math.round(Number((market.yesShares * BigInt(100)) / totalShares))
      : 50;

  const noPct = 100 - yesPct;

  const stateClass =
    market.state === MarketState.Active
      ? styles.stateActive
      : market.state === MarketState.Resolved
        ? styles.stateResolved
        : styles.stateCancelled;

  return (
    <article className={styles.card}>
      {/* Header ── id + state badge */}
      <header className={styles.header}>
        <span className={styles.marketId}>Market #{market.id.toString()}</span>
        <span className={`${styles.stateBadge} ${stateClass}`}>
          {stateLabel(market.state)}
        </span>
      </header>

      {/* Question (enriched off-chain) or fallback */}
      <p className={styles.question}>
        {market.question ?? `Market #${market.id.toString()}`}
      </p>

      {/* Probability bar */}
      <div className={styles.barWrapper} aria-label="Market probability">
        <div
          className={`${styles.barSegment} ${styles.barYes}`}
          style={{ width: `${yesPct}%` }}
        />
        <div
          className={`${styles.barSegment} ${styles.barNo}`}
          style={{ width: `${noPct}%` }}
        />
      </div>

      {/* Share counts */}
      <div className={styles.stats}>
        <span className={styles.statYes}>YES {formatShares(market.yesShares)}</span>
        <span className={styles.statNo}>NO {formatShares(market.noShares)}</span>
      </div>

      {/* Footer ── oracle + close date */}
      <footer className={styles.footer}>
        <span className={styles.meta}>
          Oracle: {market.oracle.slice(0, 6)}…{market.oracle.slice(-4)}
        </span>
        <span className={styles.meta}>Closes: {formatEndTime(market.endTime)}</span>
      </footer>
    </article>
  );
}
