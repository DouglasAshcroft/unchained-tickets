'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

type PurchasePanelProps = {
  eventId: number;
  eventTitle: string;
  availableTickets: number;
};

export function PurchasePanel({ eventId, eventTitle, availableTickets }: PurchasePanelProps) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState<'ga' | 'vip'>('ga');

  const pricePerTicket = selectedTier === 'vip' ? 0.5 : 0.25;
  const totalPrice = pricePerTicket * quantity;

  return (
    <Card className="bg-gradient-to-br from-resistance-500/10 to-acid-400/10 border-resistance-500/30">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="brand-heading text-xl">Get Your NFT Tickets</h3>
          <div className="text-sm">
            <span className="text-grit-400">Available: </span>
            <span className="text-acid-400 font-bold">{availableTickets}</span>
          </div>
        </div>
        <p className="text-grit-300 text-sm">
          Own your tickets as NFTs on Base. Secure, transferable, and yours forever.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-bone-100">Select Tier</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedTier('ga')}
              className={`p-3 rounded-lg border transition-all ${
                selectedTier === 'ga'
                  ? 'border-acid-400 bg-acid-400/10'
                  : 'border-grit-500/30 hover:border-grit-500/50'
              }`}
            >
              <div className="font-semibold text-bone-100">General Admission</div>
              <div className="text-sm text-grit-300">$0.25 USDC</div>
            </button>
            <button
              onClick={() => setSelectedTier('vip')}
              className={`p-3 rounded-lg border transition-all ${
                selectedTier === 'vip'
                  ? 'border-acid-400 bg-acid-400/10'
                  : 'border-grit-500/30 hover:border-grit-500/50'
              }`}
            >
              <div className="font-semibold text-bone-100">VIP</div>
              <div className="text-sm text-grit-300">$0.50 USDC</div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-bone-100">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg border border-grit-500/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex-1 text-center text-xl font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((current) => Math.min(8, current + 1))}
              disabled={quantity >= 8}
              className="w-10 h-10 rounded-lg border border-grit-500/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-grit-500/30">
          <div className="flex justify-between items-center">
            <span className="text-grit-300">Price per ticket:</span>
            <span className="text-lg font-bold text-acid-400">${pricePerTicket.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-grit-300">Quantity:</span>
            <span className="text-bone-100">{quantity}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-grit-400">Network:</span>
            <span className="text-acid-400">Base</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-grit-500/30">
            <span className="font-bold text-bone-100">Total:</span>
            <span className="text-2xl font-bold text-acid-400">${totalPrice.toFixed(2)} USDC</span>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full text-lg py-4"
          onClick={() => setShowCheckout(true)}
        >
          Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
        </Button>

        <div className="flex items-center gap-2 text-xs text-grit-400">
          <span>🔒</span>
          <span>Powered by OnchainKit • Secure blockchain transaction</span>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          eventId={eventId}
          eventTitle={eventTitle}
          ticketTier={selectedTier === 'vip' ? 'VIP' : 'General Admission'}
          quantity={quantity}
          totalPrice={totalPrice}
          onSuccess={(transactionId) => {
            toast.success('NFT Ticket Minted! Check your wallet.', { duration: 3000 });
            console.log('Transaction completed:', transactionId);
            setTimeout(() => {
              router.push('/my-tickets');
            }, 2000);
          }}
        />
      )}
    </Card>
  );
}

export default PurchasePanel;
