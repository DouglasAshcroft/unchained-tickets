'use client';

import { useAccount } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { base, baseSepolia } from 'wagmi/chains';
import '@coinbase/onchainkit/styles.css';
import { WalletMenu } from './WalletMenu';
import { useDevRoleProvisioning } from '@/lib/hooks/useDevRoleProvisioning';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
const selectedChain = chainId === 84532 ? baseSepolia : base;

export type WalletPanelProps = {
  className?: string;
};

export function WalletPanel({ className }: WalletPanelProps) {
  const { isConnected } = useAccount();

  // Auto-provision dev role for configured dev wallet
  useDevRoleProvisioning();

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={selectedChain}
      config={{
        appearance: {
          mode: 'dark',
        },
        wallet: {
          preference: 'all',
          display: 'modal',
        },
      }}
    >
      <div className={className}>{isConnected ? <WalletMenu /> : <ConnectWallet />}</div>
    </OnchainKitProvider>
  );
}

export default WalletPanel;
