'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';
import { base, baseSepolia } from 'wagmi/chains';
import { OnrampPurchaseFlow } from './checkout/OnrampPurchaseFlow';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  onSuccess: (transactionId: string, metadata?: { email?: string; walletAddress?: string; isNewUser?: boolean }) => void;
}

function CheckoutModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  ticketTier,
  quantity,
  totalPrice,
  onSuccess,
}: CheckoutModalProps) {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453;
  const selectedChain = chainId === 84532 ? baseSepolia : base;

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
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
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Modal Content */}
        <div
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-ink-900 rounded-xl border border-grit-500/30 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="checkout-modal-title" className="text-2xl font-bold text-bone-100">Complete Purchase</h2>
            <button
              onClick={onClose}
              className="text-grit-400 hover:text-bone-100 transition-colors p-1 rounded-lg hover:bg-white/5"
              aria-label="Close checkout modal"
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

          {/* Payment Section - Unified Onramp Purchase Flow */}
          <OnrampPurchaseFlow
            eventId={eventId}
            eventTitle={eventTitle}
            ticketTier={ticketTier}
            quantity={quantity}
            totalPrice={totalPrice}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </div>
      </div>
      </div>
    </OnchainKitProvider>
  );

  // Render modal in a portal to ensure it's outside the normal DOM hierarchy
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default CheckoutModal;
export { CheckoutModal };
