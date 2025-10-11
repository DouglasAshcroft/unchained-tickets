'use client';

import { useState } from 'react';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import type { LifecycleStatus } from '@coinbase/onchainkit/checkout';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';
import { base, baseSepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CardCheckoutForm } from '@/components/CardCheckoutForm';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  onSuccess: (transactionId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  ticketTier,
  quantity,
  totalPrice,
  onSuccess,
}: CheckoutModalProps) {
  const [_chargeId, _setChargeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { address: walletAddress } = useAccount();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');

  // Check if we're in development mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
  const selectedChain = chainId === 84532 ? baseSepolia : base;

  if (!isOpen) return null;

  // Handler to create a charge on your backend
  const handleCreateCharge = async () => {
    try {
      const response = await fetch('/api/checkout/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketTier,
          quantity,
          totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create charge');
      }

      const data = await response.json();
      return data.chargeId;
    } catch (error) {
      console.error('Error creating charge:', error);
      throw error;
    }
  };

  // Lifecycle status handler
  const handleStatusChange = (status: LifecycleStatus) => {
    console.log('Checkout status:', status);

    if (status.statusName === 'success' && status.statusData) {
      // Transaction successful
      const transactionId = status.statusData.chargeId;
      onSuccess(transactionId);

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  // Mock payment handler for development mode
  const handleMockPayment = async () => {
    setIsProcessing(true);

    try {
      // Call API to create charge and mint NFT
      const response = await fetch('/api/checkout/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketTier,
          quantity,
          totalPrice,
          walletAddress, // Pass wallet address for NFT minting
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create charge');
      }

      const data = await response.json();
      const mockTransactionId = data.chargeId;

      if (data.status === 'pending-mint') {
        console.warn('Dev minting skipped: configure BASE_RPC_URL, MINTING_PRIVATE_KEY, and NFT_CONTRACT_ADDRESS to enable on-chain minting.');
        toast.error('Minting skipped: configure RPC, contract, and minting key to enable dev minting.');
      }

      if (data.status === 'mint-failed') {
        toast.error('NFT mint failed in dev mode. Fix minting credentials and retry.');
        throw new Error('Minting failed in dev mode');
      }

      // Save purchase to localStorage for My Tickets page
      const purchase = {
        id: mockTransactionId,
        eventId,
        eventTitle,
        tier: ticketTier,
        quantity,
        totalPrice,
        transactionId: mockTransactionId,
        tokenId: data.tokenId ?? null,
        status: data.status ?? 'completed',
        purchasedAt: new Date().toISOString(),
      };

      const existingPurchases = JSON.parse(localStorage.getItem('unchained_purchases') || '[]');
      localStorage.setItem('unchained_purchases', JSON.stringify([...existingPurchases, purchase]));

      // Simulate 2-second payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Trigger success callback
      onSuccess(mockTransactionId);

    } catch (error) {
      console.error('Mock payment error:', error);
      toast.error('Charge created, but minting failed. Fix minting credentials and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md mx-4">
          <div className="bg-ink-900 rounded-xl border border-grit-500/30 shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-bone-100">Complete Purchase</h2>
            <button
              onClick={onClose}
              className="text-grit-400 hover:text-bone-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 space-y-3">
            <div className="p-4 bg-ink-800 rounded-lg border border-grit-500/20">
              <h3 className="text-sm font-semibold text-acid-400 mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-grit-300">Event:</span>
                  <span className="text-bone-100 font-medium">{eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grit-300">Tier:</span>
                  <span className="text-bone-100">{ticketTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grit-300">Quantity:</span>
                  <span className="text-bone-100">{quantity}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-grit-500/30">
                  <span className="text-bone-100 font-semibold">Total:</span>
                  <span className="text-acid-400 font-bold">${totalPrice.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Toggle */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-ink-800/70 border border-grit-500/30 rounded-lg">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paymentMethod === 'wallet'
                    ? 'bg-acid-400/20 text-acid-300'
                    : 'text-grit-300 hover:text-bone-100'
                }`}
              >
                Crypto Wallet
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-acid-400/20 text-acid-300'
                    : 'text-grit-300 hover:text-bone-100'
                }`}
              >
                Credit / Debit Card
              </button>
            </div>
          </div>

          {/* Payment Section */}
          {paymentMethod === 'wallet' ? (
            isDevMode ? (
            /* Development Mode: Mock Payment */
            <div className="space-y-4">
              <button
                onClick={handleMockPayment}
                disabled={isProcessing || !walletAddress}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-acid-400 to-hack-green text-ink-900 font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                    Minting NFT Ticket...
                  </>
                ) : (
                  <>
                    {walletAddress ? '🎫 Purchase & Mint NFT Ticket' : '⚠️ Connect Wallet First'}
                  </>
                )}
              </button>

              {/* Dev Mode Info */}
              <div className="p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
                <p className="text-xs text-cobalt-300">
                  {walletAddress ? (
                    <>
                      🎉 <strong>Wallet Connected:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} - Click to mint a real NFT ticket on Base Sepolia testnet!
                    </>
                  ) : (
                    <>
                      ⚠️ <strong>Connect your wallet first</strong> to receive the NFT ticket. The button will activate once connected.
                    </>
                  )}
                </p>
              </div>
            </div>
            ) : (
              /* Production Mode: Real OnchainKit Checkout */
              <>
                <Checkout
                  chargeHandler={handleCreateCharge}
                  onStatus={handleStatusChange}
                >
                  <CheckoutButton
                    coinbaseBranded
                    text="Pay with Coinbase"
                  />
                  <CheckoutStatus />
                </Checkout>

                {/* Production Info */}
                <div className="mt-6 p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
                  <p className="text-xs text-cobalt-300">
                    🔒 Secure payment powered by Coinbase. Your tickets will be minted as NFTs after payment confirmation.
                  </p>
                </div>
              </>
            )
          ) : (
            <CardCheckoutForm
              eventId={eventId}
              eventTitle={eventTitle}
              ticketTier={ticketTier}
              quantity={quantity}
              totalPrice={totalPrice}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </div>
      </div>
    </OnchainKitProvider>
  );
}
