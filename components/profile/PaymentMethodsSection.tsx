'use client';

import { useState } from 'react';

interface PaymentMethodsSectionProps {
  stripeCustomerId: string | null;
  hasWallet: boolean;
}

export function PaymentMethodsSection({
  stripeCustomerId,
  hasWallet,
}: PaymentMethodsSectionProps) {
  const [showAddCard, setShowAddCard] = useState(false);

  // TODO: Integrate with Stripe for actual payment method management
  // For now, this is a placeholder UI

  return (
    <div className="space-y-6">
      {/* Base Wallet Education Section */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-bone-100">Why Use a Base Wallet?</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-resistance-500 flex items-center justify-center text-bone-100 font-bold text-sm">
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-bone-100 mb-1">Near-Zero Fees</h4>
              <p className="text-sm text-grit-300">Base is an Ethereum Layer 2 network with transaction fees typically under $0.01</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hack-green flex items-center justify-center text-ink-900 font-bold text-sm">
              🔒
            </div>
            <div>
              <h4 className="font-semibold text-bone-100 mb-1">Secure Checkout</h4>
              <p className="text-sm text-grit-300">Your tickets are NFTs secured by Ethereum's battle-tested security</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-acid-400 flex items-center justify-center text-ink-900 font-bold text-sm">
              🎫
            </div>
            <div>
              <h4 className="font-semibold text-bone-100 mb-1">True Ownership</h4>
              <p className="text-sm text-grit-300">You own your tickets as NFTs - collectible, transferable, and fraud-proof</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-resistance-500/10 border border-resistance-500/30 rounded-lg">
          <h4 className="font-semibold text-bone-100 mb-2">Recommended: Coinbase Wallet</h4>
          <p className="text-sm text-grit-300 mb-4">
            Coinbase Wallet offers seamless onramp/offramp, letting you easily convert between USD and crypto
          </p>
          <a
            href="https://www.coinbase.com/wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-acid-400 text-ink-900 rounded-lg hover:brightness-110 transition-all font-medium text-sm"
          >
            Get Coinbase Wallet →
          </a>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-bone-100">Payment Methods</h2>
            <p className="text-sm text-grit-300">
              {hasWallet
                ? 'Add a card for venues that don\'t accept crypto'
                : 'Manage your payment methods'}
            </p>
          </div>
        </div>

        {hasWallet && (
          <div className="mb-4 p-4 bg-hack-green/10 border border-hack-green/20 rounded-lg">
            <p className="text-hack-green text-sm flex items-center">
              <span className="mr-2">✓</span>
              Onchain wallet connected - preferred payment method
            </p>
          </div>
        )}

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
            <strong>Note:</strong> Traditional payment methods may include processing fees. Crypto payments have minimal network fees.
          </p>
        </div>
      </div>
    </div>
  );
}
