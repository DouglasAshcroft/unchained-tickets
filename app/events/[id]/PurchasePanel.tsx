'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);

type TicketTypePerk = {
  id: number;
  name: string;
  description?: string | null;
  instructions?: string | null;
  quantity: number;
};

type TicketTypeOption = {
  id: number;
  name: string;
  description?: string | null;
  pricingType?: 'general_admission' | 'reserved' | 'mixed';
  priceCents?: number | null;
  currency?: string | null;
  isActive?: boolean | null;
  perks?: TicketTypePerk[];
};

type PurchasePanelProps = {
  eventId: number;
  eventTitle: string;
  availableTickets: number;
  ticketTypes: TicketTypeOption[];
};

const pricingTypeLabels: Record<string, string> = {
  general_admission: 'General admission',
  reserved: 'Reserved seating',
  mixed: 'Mixed seating',
};

const formatCurrency = (priceCents?: number | null, currencyCode?: string | null) => {
  if (priceCents == null) return 'Price TBD';
  if (priceCents === 0) return 'Free';

  const code = (currencyCode || 'USD').toUpperCase();

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch (error) {
    console.warn('Unable to format currency', { priceCents, currencyCode, error });
    return `$${(priceCents / 100).toFixed(2)} ${code}`;
  }
};

export function PurchasePanel({
  eventId,
  eventTitle,
  availableTickets,
  ticketTypes,
}: PurchasePanelProps) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const activeTicketTypes = useMemo(
    () => ticketTypes.filter((tier) => tier.isActive !== false),
    [ticketTypes]
  );

  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(
    activeTicketTypes[0]?.id ?? null
  );

  useEffect(() => {
    if (!activeTicketTypes.length) {
      setSelectedTicketTypeId(null);
      return;
    }

    if (!selectedTicketTypeId || !activeTicketTypes.some((tier) => tier.id === selectedTicketTypeId)) {
      setSelectedTicketTypeId(activeTicketTypes[0].id);
    }
  }, [activeTicketTypes, selectedTicketTypeId]);

  const selectedTicketType = useMemo(
    () => activeTicketTypes.find((tier) => tier.id === selectedTicketTypeId) ?? null,
    [activeTicketTypes, selectedTicketTypeId]
  );

  const priceCents = selectedTicketType?.priceCents ?? null;
  const currencyCode = (selectedTicketType?.currency || 'USD').toUpperCase();
  const pricePerTicket = priceCents != null ? priceCents / 100 : 0;
  const totalPrice = pricePerTicket * quantity;
  const totalPriceCents = priceCents != null ? priceCents * quantity : null;
  const formattedPricePerTicket = formatCurrency(priceCents, currencyCode);
  const formattedTotalPrice = formatCurrency(totalPriceCents, currencyCode);
  const perksForTier = selectedTicketType?.perks ?? [];

  const canCheckout = Boolean(selectedTicketType) && quantity > 0;

  if (!activeTicketTypes.length) {
    return (
      <Card className="bg-ink-900/60 border border-grit-500/30 p-6">
        <div className="space-y-3 text-sm text-grit-300">
          <h3 className="brand-heading text-lg text-bone-100">Ticket sales paused</h3>
          <p>
            This event doesn&apos;t have any active ticket tiers yet. Check back soon or contact the venue for presale access.
          </p>
        </div>
      </Card>
    );
  }

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
          <label className="block text-sm font-medium text-bone-100">Select tier</label>
          <div className="space-y-2">
            {activeTicketTypes.map((tier) => {
              const isSelected = tier.id === selectedTicketType?.id;
              const formatted = formatCurrency(tier.priceCents, tier.currency);
              const pricingLabel = tier.pricingType
                ? pricingTypeLabels[tier.pricingType] ?? tier.pricingType
                : 'Custom access';

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTicketTypeId(tier.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? 'border-acid-400 bg-acid-400/10'
                      : 'border-grit-500/30 hover:border-grit-500/50'
                  }`}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-bone-100">{tier.name}</div>
                      <div className="text-xs uppercase tracking-wide text-grit-400">
                        {pricingLabel}
                      </div>
                      {tier.description && (
                        <p className="mt-1 text-xs text-grit-400">{tier.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-bone-100 font-semibold">{formatted}</div>
                      <div className="text-xs text-grit-400">{(tier.currency || 'USD').toUpperCase()}</div>
                    </div>
                  </div>
                  {tier.perks && tier.perks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tier.perks.map((perk) => (
                        <span
                          key={perk.id}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            isSelected
                              ? 'border-acid-400/50 text-acid-200 bg-acid-400/10'
                              : 'border-grit-500/40 text-grit-300'
                          }`}
                        >
                          {perk.name} · x{perk.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
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
            <span className="text-lg font-bold text-acid-400">{formattedPricePerTicket}</span>
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
            <span className="text-2xl font-bold text-acid-400">{formattedTotalPrice}</span>
          </div>
        </div>

        {perksForTier.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-grit-500/30">
            <span className="text-sm font-medium text-bone-100">Perks included</span>
            <ul className="space-y-2 text-xs text-grit-300">
              {perksForTier.map((perk) => (
                <li key={perk.id} className="rounded-lg border border-grit-500/20 bg-ink-900/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-bone-100 font-medium">{perk.name}</span>
                    <span className="text-grit-400">x{perk.quantity}</span>
                  </div>
                  {perk.description && <p className="mt-1 text-grit-400">{perk.description}</p>}
                  {perk.instructions && (
                    <p className="mt-1 text-grit-500">Redeem: {perk.instructions}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full text-lg py-4"
          onClick={() => {
            if (canCheckout) {
              setIsLoadingCheckout(true);
              // Small delay to show loading state before modal opens
              setTimeout(() => {
                setShowCheckout(true);
                setIsLoadingCheckout(false);
              }, 150);
            }
          }}
          disabled={!canCheckout || isLoadingCheckout}
        >
          {isLoadingCheckout ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
              Opening checkout...
            </span>
          ) : (
            <>
              Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
              {selectedTicketType ? ` · ${selectedTicketType.name}` : ''}
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-xs text-grit-400">
          <span>🔒</span>
          <span>Powered by OnchainKit • Secure blockchain transaction</span>
        </div>
      </div>

      {showCheckout && selectedTicketType && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          eventId={eventId}
          eventTitle={eventTitle}
          ticketTier={selectedTicketType.name}
          quantity={quantity}
          totalPrice={totalPrice}
          onSuccess={(transactionId, metadata) => {
            toast.success('NFT Ticket Minted! Check your wallet.', { duration: 3000 });
            console.log('Transaction completed:', transactionId);

            // Redirect new users from onramp to profile setup
            if (metadata?.isNewUser && metadata?.email && metadata?.walletAddress) {
              setTimeout(() => {
                const params = new URLSearchParams({
                  from: 'purchase',
                  wallet: metadata.walletAddress!,  // Non-null assertion: checked by if condition
                  email: metadata.email!,           // Non-null assertion: checked by if condition
                });
                router.push(`/profile/setup?${params.toString()}`);
              }, 2000);
            } else {
              // Existing users go to their tickets
              setTimeout(() => {
                router.push('/my-tickets');
              }, 2000);
            }
          }}
        />
      )}
    </Card>
  );
}

export default PurchasePanel;
