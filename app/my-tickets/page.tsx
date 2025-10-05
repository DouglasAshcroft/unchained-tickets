'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRCode } from '@/components/ui/QRCode';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Ticket {
  id: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  venue: string;
  tier: string;
  tokenId?: string;
  qrCode: string;
  status: 'active' | 'used' | 'expired';
}

interface Purchase {
  id: string;
  eventId: number;
  eventTitle: string;
  tier: string;
  quantity: number;
  totalPrice: number;
  transactionId: string;
  purchasedAt: string;
}

export default function MyTicketsPage() {
  const { address, isConnected } = useAccount();
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  // Load and validate tickets from localStorage (dev mode) or blockchain (production)
  useEffect(() => {
    const loadAndValidateTickets = async () => {
      if (isDevMode) {
        const purchases = JSON.parse(localStorage.getItem('unchained_purchases') || '[]') as Purchase[];

        if (purchases.length === 0) {
          setTickets([]);
          return;
        }

        try {
          // Validate purchases against database
          const response = await fetch('/api/tickets/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchases }),
          });

          if (!response.ok) {
            console.error('Failed to validate tickets');
            setTickets([]);
            return;
          }

          const { validTickets, invalidTickets } = await response.json();

          // Convert valid purchases to tickets format
          const loadedTickets: Ticket[] = validTickets.flatMap((purchase: any) => {
            // Create one ticket per quantity
            return Array.from({ length: purchase.quantity }, (_, index) => ({
              id: `${purchase.id}-${index}`,
              eventId: purchase.eventId,
              eventTitle: purchase.eventTitle,
              eventDate: purchase.eventData?.startsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              venue: purchase.eventData?.venue?.name || 'Unknown Venue',
              tier: purchase.tier,
              tokenId: `${purchase.transactionId.slice(0, 10)}...${index}`,
              qrCode: `UNCHAINED-TICKET:${purchase.eventId}:${purchase.id}:${index}:${purchase.transactionId}`,
              status: 'active' as const,
            }));
          });

          setTickets(loadedTickets);

          // Clean up invalid purchases from localStorage
          if (invalidTickets.length > 0) {
            const validPurchaseIds = validTickets.map((p: any) => p.id);
            const cleanedPurchases = purchases.filter((p) => validPurchaseIds.includes(p.id));
            localStorage.setItem('unchained_purchases', JSON.stringify(cleanedPurchases));

            console.log(`Removed ${invalidTickets.length} invalid tickets:`, invalidTickets);
          }
        } catch (error) {
          console.error('Error validating tickets:', error);
          setTickets([]);
        }
      } else {
        // Production mode: Fetch from blockchain/database
        // TODO: Implement blockchain NFT fetching
        setTickets([]);
      }
    };

    loadAndValidateTickets();
  }, [isDevMode]);

  // In dev mode, no wallet connection required
  const shouldShowWalletPrompt = !isDevMode && !isConnected;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge tone="success">Active</Badge>;
      case 'used':
        return <Badge tone="info">Used</Badge>;
      case 'expired':
        return <Badge tone="error">Expired</Badge>;
      default:
        return null;
    }
  };

  if (shouldShowWalletPrompt) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full text-center">
            <div className="space-y-6">
              <div className="text-6xl">🔒</div>
              <div>
                <h2 className="brand-heading text-2xl mb-3">Connect Your Wallet</h2>
                <p className="text-grit-300">
                  Please connect your wallet to view your NFT tickets.
                </p>
              </div>
              <div className="text-sm text-grit-400">
                Your tickets are stored as NFTs on the Base blockchain. Connect with the same wallet you used to purchase tickets.
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="brand-heading text-4xl font-bold mb-2 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            My Tickets
          </h1>
          <p className="text-grit-300">
            Your NFT tickets are stored on Base blockchain
          </p>
          {!isDevMode && address && (
            <div className="mt-2 text-sm text-grit-400">
              Connected: <span className="text-acid-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          )}
          {isDevMode && (
            <div className="mt-2 text-sm text-cobalt-400">
              🧪 Development Mode - No wallet required
            </div>
          )}
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <Card className="text-center py-16">
            <div className="space-y-4">
              <div className="text-6xl">🎫</div>
              <div>
                <h3 className="brand-heading text-2xl mb-2">No Tickets Yet</h3>
                <p className="text-grit-300 mb-6">
                  You haven&apos;t purchased any tickets yet. Browse upcoming events to get started!
                </p>
                <Link href="/events">
                  <Button variant="primary">Browse Events</Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="space-y-4">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="brand-heading text-xl mb-1 text-bone-100">
                        {ticket.eventTitle}
                      </h3>
                      <p className="text-sm text-grit-400">{ticket.venue}</p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-grit-400">📅</span>
                      <span className="text-bone-100">
                        {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-grit-400">🎟️</span>
                      <span className="text-bone-100">{ticket.tier}</span>
                    </div>
                    {ticket.tokenId && (
                      <div className="flex items-center gap-2">
                        <span className="text-grit-400">🔗</span>
                        <span className="text-bone-100 font-mono text-xs">
                          {ticket.tokenId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* QR Code Section */}
                  {ticket.status === 'active' && (
                    <div className="pt-4 border-t border-grit-500/30">
                      {showQRCode === ticket.id ? (
                        <div className="space-y-3">
                          <div className="bg-bone-100 p-4 rounded-lg">
                            <QRCode
                              value={ticket.qrCode}
                              size={200}
                              caption="Present at entry"
                            />
                          </div>
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => setShowQRCode(null)}
                          >
                            Hide QR Code
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => setShowQRCode(ticket.id)}
                        >
                          Show QR Code
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Event Link */}
                  <Link
                    href={`/events/${ticket.eventId}`}
                    className="block text-sm text-acid-400 hover:text-hack-green transition-colors text-center"
                  >
                    View Event Details →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-cobalt-500/10 border-cobalt-500/30">
          <div className="space-y-3">
            <h3 className="font-semibold text-bone-100 flex items-center gap-2">
              <span>ℹ️</span>
              About Your NFT Tickets
            </h3>
            <ul className="space-y-2 text-sm text-grit-300">
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>Your tickets are NFTs stored on the Base blockchain and secured by your wallet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>Show the QR code at the venue entrance for verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>Tickets can be transferred to other wallets if you need to give them to someone else.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>Once scanned at the venue, tickets will be marked as &quot;Used&quot; and cannot be reused.</span>
              </li>
            </ul>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
