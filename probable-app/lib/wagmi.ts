import { createConfig, http } from 'wagmi';
import { sepolia, localhost } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia, localhost],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});
