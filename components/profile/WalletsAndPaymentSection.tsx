'use client';

import { useState } from 'react';
import { Wallet, ConnectWallet, WalletDropdown } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { BASE_EDUCATION, WALLET_MESSAGES } from '@/lib/content/baseMessaging';

interface WalletsAndPaymentSectionProps {
  wallets: Array<{
    wallet: {
      address: string;
      chain: string;
    };
    isPrimary: boolean;
  }>;
  stripeCustomerId: string | null;
}

export function WalletsAndPaymentSection({
  wallets,
  stripeCustomerId,
}: WalletsAndPaymentSectionProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const { address, isConnected } = useAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
    <div className="space-y-6">
      {/* Base Wallet Education Section - Using centralized messaging */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-bone-100">{BASE_EDUCATION.whyBase.headline}</h2>
        <p className="text-sm text-grit-400 mb-6">{BASE_EDUCATION.whyBase.description}</p>
        <div className="space-y-4">
          {BASE_EDUCATION.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-resistance-500 flex items-center justify-center text-bone-100 font-bold text-sm">
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-semibold text-bone-100 mb-1">{benefit.title}</h4>
                <p className="text-sm text-grit-300">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Connection with OnchainKit */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1 text-bone-100">Onchain Wallet</h2>
          <p className="text-sm text-grit-300">
            Connect your Base wallet to enable crypto payments and NFT tickets
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-8 bg-ink-700 border border-grit-500/30 rounded-lg">
            <p className="text-grit-400 mb-6">{WALLET_MESSAGES.notConnected.headline}</p>
            <p className="text-sm text-grit-500 mb-6">{WALLET_MESSAGES.notConnected.description}</p>

            <div className="flex justify-center">
              <Wallet>
                <ConnectWallet className="bg-resistance-500 hover:brightness-110 text-bone-100 px-6 py-3 rounded-lg font-medium transition-all">
                  <Avatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity address={address} schemaId="">
                    <Avatar />
                    <Name />
                    <Address />
                  </Identity>
                </WalletDropdown>
              </Wallet>
            </div>

            <div className="mt-6 p-4 bg-resistance-500/10 border border-resistance-500/30 rounded-lg">
              <p className="text-sm text-grit-300 mb-2">
                <strong className="text-bone-100">{BASE_EDUCATION.gettingStarted.newToCrypto}</strong>
              </p>
              <p className="text-sm text-grit-300">
                {BASE_EDUCATION.gettingStarted.helpText}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-hack-green/10 border border-hack-green/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔵</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-sm text-bone-100">{address ? formatAddress(address) : ''}</code>
                    <span className="px-2 py-0.5 bg-hack-green text-ink-900 text-xs rounded-full font-medium">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-grit-400 mt-1">Base Network</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (address) navigator.clipboard.writeText(address);
                }}
                className="text-sm text-acid-400 hover:brightness-110 transition-all"
              >
                Copy
              </button>
            </div>

            {/* Existing Connected Wallets from Database */}
            {wallets.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-grit-500/30">
                <p className="text-sm text-grit-400 mb-2">Previously connected wallets:</p>
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
            )}

            <div className="mt-4 p-4 bg-hack-green/10 border border-hack-green/30 rounded-lg">
              <p className="text-hack-green text-sm flex items-center">
                <span className="mr-2">✓</span>
                {WALLET_MESSAGES.connected.preferredMethod}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Traditional Payment Methods */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-bone-100">{WALLET_MESSAGES.traditional.headline}</h2>
            <p className="text-sm text-grit-300">
              {WALLET_MESSAGES.traditional.description}
            </p>
          </div>
        </div>

        {!stripeCustomerId ? (
          <div className="text-center py-8 bg-ink-700 border border-grit-500/30 rounded-lg">
            <p className="text-grit-400 mb-4">No payment methods added</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="px-6 py-2 bg-resistance-500 hover:brightness-110 rounded-lg font-medium transition-all text-bone-100"
            >
              Add Credit/Debit Card
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-ink-700 border border-grit-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💳</div>
                <div>
                  <p className="font-medium text-bone-100">Card ending in ••••</p>
                  <p className="text-xs text-grit-400">Expires MM/YY</p>
                </div>
              </div>
              <button className="text-sm text-resistance-500 hover:brightness-110 transition-all">
                Remove
              </button>
            </div>

            <button
              onClick={() => setShowAddCard(true)}
              className="w-full py-3 border-2 border-dashed border-grit-500 hover:border-grit-400 rounded-lg text-grit-400 hover:text-bone-100 transition-all"
            >
              + Add Another Card
            </button>
          </div>
        )}

        {showAddCard && (
          <div className="mt-6 p-6 bg-ink-700 rounded-lg border-2 border-resistance-500">
            <h3 className="font-semibold mb-4 text-bone-100">Add Payment Method</h3>
            <p className="text-sm text-grit-300 mb-4">
              Stripe integration coming soon. For now, use your connected wallet for payments.
            </p>
            <button
              onClick={() => setShowAddCard(false)}
              className="px-4 py-2 bg-grit-500 hover:bg-grit-400 rounded-lg text-sm transition-all text-bone-100"
            >
              Close
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-acid-400/10 border border-acid-400/20 rounded-lg">
          <p className="text-acid-400 text-sm">
            <strong>Note:</strong> {WALLET_MESSAGES.traditional.note}
          </p>
        </div>
      </div>
    </div>
  );
}
