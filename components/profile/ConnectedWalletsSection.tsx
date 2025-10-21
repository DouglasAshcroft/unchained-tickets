'use client';

interface ConnectedWalletsSectionProps {
  wallets: Array<{
    wallet: {
      address: string;
      chain: string;
    };
    isPrimary: boolean;
  }>;
}

export function ConnectedWalletsSection({ wallets }: ConnectedWalletsSectionProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainIcon = (chain: string) => {
    const icons: Record<string, string> = {
      ethereum: '⟠',
      base: '🔵',
      polygon: '💜',
      optimism: '🔴',
      arbitrum: '🔷',
    };
    return icons[chain.toLowerCase()] || '🔗';
  };

  return (
    <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1 text-bone-100">Connected Wallets</h2>
        <p className="text-sm text-grit-300">
          Wallets connected to your account for authentication and payments
        </p>
      </div>

      {wallets.length > 0 ? (
        <div className="space-y-3">
          {wallets.map(({ wallet, isPrimary }) => (
            <div
              key={wallet.address}
              className="flex items-center justify-between bg-ink-700 border border-grit-500/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getChainIcon(wallet.chain)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-sm text-bone-100">{formatAddress(wallet.address)}</code>
                    {isPrimary && (
                      <span className="px-2 py-0.5 bg-resistance-500 text-bone-100 text-xs rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-grit-400 mt-1 capitalize">{wallet.chain}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                }}
                className="text-sm text-acid-400 hover:brightness-110 transition-all"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-ink-700 border border-grit-500/30 rounded-lg">
          <p className="text-grit-400 mb-4">No wallets connected</p>
          <p className="text-sm text-grit-500">Connect a wallet to enable onchain payments</p>
        </div>
      )}
    </div>
  );
}
