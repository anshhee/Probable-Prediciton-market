'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import styles from './ConnectWallet.module.css';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className={styles.card}>
        <div className={styles.status}>
          <span className={styles.dot} />
          <span className={styles.network}>{chain?.name ?? 'Unknown Network'}</span>
        </div>
        <p className={styles.address}>{truncateAddress(address)}</p>
        <button className={styles.disconnectBtn} onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className={styles.connectBtn}
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
    >
      {isPending ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
