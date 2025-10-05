'use client';

import { useState } from 'react';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import type { LifecycleStatus } from '@coinbase/onchainkit/checkout';

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

  // Check if we're in development mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

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
      // Simulate API call to create charge
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
      const mockTransactionId = data.chargeId;

      // Save purchase to localStorage for My Tickets page
      const purchase = {
        id: mockTransactionId,
        eventId,
        eventTitle,
        tier: ticketTier,
        quantity,
        totalPrice,
        transactionId: mockTransactionId,
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
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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

          {/* Payment Section */}
          {isDevMode ? (
            /* Development Mode: Mock Payment */
            <div className="space-y-4">
              <button
                onClick={handleMockPayment}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-acid-400 to-hack-green text-ink-900 font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    🧪 Simulate Payment (Dev Mode)
                  </>
                )}
              </button>

              {/* Dev Mode Info */}
              <div className="p-3 bg-cobalt-500/10 border border-cobalt-500/30 rounded-lg">
                <p className="text-xs text-cobalt-300">
                  🚀 <strong>Development Mode:</strong> This simulates a successful payment without connecting a wallet or spending real money. Perfect for testing and demos!
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
          )}
        </div>
      </div>
    </div>
  );
}
