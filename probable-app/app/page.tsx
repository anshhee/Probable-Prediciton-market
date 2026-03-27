import ConnectWallet from './components/ConnectWallet';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Probable</h1>
        <p className={styles.subtitle}>Decentralized prediction markets on Ethereum</p>
        <ConnectWallet />
      </div>
    </main>
  );
}

