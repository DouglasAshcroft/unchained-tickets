"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCode } from "@/components/ui/QRCode";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";

interface Perk {
  name: string;
  maxQuantity: number;
  consumed: number;
  description?: string | null;
  instructions?: string | null;
}

interface Ticket {
  id: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  venue: string;
  tier: string;
  tokenId?: string;
  qrCode: string;
  status: "active" | "used" | "expired";
  onChainState?: "ACTIVE" | "USED" | "SOUVENIR"; // 0=ACTIVE, 1=USED, 2=SOUVENIR
  posterImageUrl?: string;
  perks?: Perk[]; // Available perks for this ticket tier
  rarityMultiplier?: number; // Collectible rarity (1.0, 1.5, 2.0, etc.)
  isRevealed?: boolean; // Whether the collectible poster is revealed
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
  const [openQRCodes, setOpenQRCodes] = useState<Record<string, boolean>>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  // Enrich tickets with on-chain state and metadata
  const enrichTicketsWithOnChainData = async (ticketsToEnrich: Ticket[]) => {
    const enrichedTickets = await Promise.all(
      ticketsToEnrich.map(async (ticket) => {
        if (!ticket.tokenId) return ticket;

        try {
          // Fetch metadata which includes on-chain state
          const metadataResponse = await fetch(
            `/api/metadata/${ticket.tokenId}`
          );
          if (!metadataResponse.ok) return ticket;

          const metadata = await metadataResponse.json();

          // Extract on-chain state from attributes
          const onChainStateAttr = metadata.attributes?.find(
            (attr: any) => attr.trait_type === "On-Chain State"
          );
          const onChainState = onChainStateAttr?.value as
            | "ACTIVE"
            | "USED"
            | "SOUVENIR"
            | undefined;

          // Extract rarity multiplier
          const rarityAttr = metadata.attributes?.find(
            (attr: any) => attr.trait_type === "Rarity Multiplier"
          );
          const rarityMultiplier = rarityAttr?.value
            ? parseFloat(rarityAttr.value)
            : undefined;

          // Extract revealed status
          const revealedAttr = metadata.attributes?.find(
            (attr: any) => attr.trait_type === "Revealed"
          );
          const isRevealed = revealedAttr?.value === "Yes";

          return {
            ...ticket,
            onChainState,
            posterImageUrl: metadata.image,
            rarityMultiplier,
            isRevealed,
          };
        } catch (error) {
          console.error(`Failed to enrich ticket ${ticket.id}:`, error);
          return ticket;
        }
      })
    );

    setTickets(enrichedTickets);
  };

  // Load and validate tickets from localStorage (dev mode) or blockchain (production)
  useEffect(() => {
    const loadAndValidateTickets = async () => {
      if (isDevMode) {
        const purchases = JSON.parse(
          localStorage.getItem("unchained_purchases") || "[]"
        ) as Purchase[];

        if (purchases.length === 0) {
          setTickets([]);
          return;
        }

        try {
          // Validate purchases against database
          const response = await fetch("/api/tickets/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchases }),
          });

          if (!response.ok) {
            console.error("Failed to validate tickets");
            setTickets([]);
            return;
          }

          const { validTickets, invalidTickets } = await response.json();

          // Convert valid purchases to tickets format
          const loadedTickets: Ticket[] = validTickets.flatMap(
            (purchase: any) => {
              const ticketType = purchase.eventData?.ticketTypes?.find(
                (type: any) =>
                  typeof type.name === "string" &&
                  type.name.toLowerCase() ===
                    String(purchase.tier).toLowerCase()
              );

              const tierPerks: Perk[] = (ticketType?.perks ?? []).map(
                (perk: any) => ({
                  name: perk.name,
                  maxQuantity: perk.quantity ?? 1,
                  consumed: 0,
                  description: perk.description,
                  instructions: perk.instructions,
                })
              );

              // Create one ticket per quantity
              return Array.from({ length: purchase.quantity }, (_, index) => ({
                id: `${purchase.id}-${index}`,
                eventId: purchase.eventId,
                eventTitle: purchase.eventTitle,
                eventDate:
                  purchase.eventData?.startsAt ||
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                venue: purchase.eventData?.venue?.name || "Unknown Venue",
                tier: purchase.tier,
                tokenId: `${purchase.transactionId.slice(0, 10)}...${index}`,
                qrCode: `UNCHAINED-TICKET:${purchase.eventId}:${purchase.id}:${index}:${purchase.transactionId}`,
                status: "active" as const,
                perks: tierPerks,
              }));
            }
          );

          setTickets(loadedTickets);
          setOpenQRCodes((prev) => {
            const next: Record<string, boolean> = { ...prev };
            Object.keys(next).forEach((id) => {
              if (!loadedTickets.some((ticket) => ticket.id === id)) {
                delete next[id];
              }
            });

            loadedTickets.forEach((ticket) => {
              if (
                ticket.status === "active" &&
                ticket.onChainState !== "SOUVENIR"
              ) {
                if (next[ticket.id] === undefined) {
                  next[ticket.id] = true;
                }
              } else {
                next[ticket.id] = false;
              }
            });

            return next;
          });

          // Fetch on-chain state and poster images for each ticket
          enrichTicketsWithOnChainData(loadedTickets);

          // Clean up invalid purchases from localStorage
          if (invalidTickets.length > 0) {
            const validPurchaseIds = validTickets.map((p: any) => p.id);
            const cleanedPurchases = purchases.filter((p) =>
              validPurchaseIds.includes(p.id)
            );
            localStorage.setItem(
              "unchained_purchases",
              JSON.stringify(cleanedPurchases)
            );

            console.log(
              `Removed ${invalidTickets.length} invalid tickets:`,
              invalidTickets
            );
          }
        } catch (error) {
          console.error("Error validating tickets:", error);
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

  const getStatusBadge = (status: string, onChainState?: string) => {
    // Prioritize on-chain state if available
    if (onChainState === "SOUVENIR") {
      return <Badge tone="success">Collectible</Badge>;
    }
    if (onChainState === "USED") {
      return <Badge tone="info">Used</Badge>;
    }

    switch (status) {
      case "active":
        return <Badge tone="success">Active</Badge>;
      case "used":
        return <Badge tone="info">Used</Badge>;
      case "expired":
        return <Badge tone="error">Expired</Badge>;
      default:
        return null;
    }
  };

  const getRarityLabel = (multiplier?: number) => {
    if (!multiplier) return null;
    if (multiplier >= 2.0) return "VIP";
    if (multiplier >= 1.5) return "Premium";
    return "Standard";
  };

  const getRarityColor = (multiplier?: number) => {
    if (!multiplier) return "text-grit-400";
    if (multiplier >= 2.0) return "text-yellow-400";
    if (multiplier >= 1.5) return "text-purple-400";
    return "text-blue-400";
  };

  if (shouldShowWalletPrompt) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full text-center">
            <div className="space-y-6">
              <div className="text-6xl">🔒</div>
              <div>
                <h2 className="brand-heading text-2xl mb-3">
                  Connect Your Wallet
                </h2>
                <p className="text-grit-300">
                  Please connect your wallet to view your NFT tickets.
                </p>
              </div>
              <div className="text-sm text-grit-400">
                Your tickets are stored as NFTs on the Base blockchain. Connect
                with the same wallet you used to purchase tickets.
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
              Connected:{" "}
              <span className="text-acid-400 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
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
                  You haven&apos;t purchased any tickets yet. Browse upcoming
                  events to get started!
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
                    {getStatusBadge(ticket.status, ticket.onChainState)}
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-grit-400">📅</span>
                      <span className="text-bone-100">
                        {new Date(ticket.eventDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
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

                  {/* Perks Section - Only for active tickets */}
                  {ticket.perks &&
                    ticket.perks.length > 0 &&
                    ticket.status === "active" && (
                      <div className="pt-4 border-t border-grit-500/30">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎁</span>
                            <h4 className="font-semibold text-hack-green">
                              Included Perks
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {ticket.perks.map((perk, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-grit-500/20 p-3 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-bone-100">
                                    {perk.name}
                                  </p>
                                  <p className="text-xs text-grit-400">
                                    {perk.consumed} of {perk.maxQuantity} used
                                  </p>
                                  {perk.description && (
                                    <p className="mt-1 text-xs text-grit-400">
                                      {perk.description}
                                    </p>
                                  )}
                                  {perk.instructions && (
                                    <p className="mt-1 text-xs text-grit-500">
                                      Redeem: {perk.instructions}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {perk.consumed < perk.maxQuantity ? (
                                    <Badge tone="success">
                                      {perk.maxQuantity - perk.consumed} left
                                    </Badge>
                                  ) : (
                                    <Badge tone="error">Used</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-grit-400 mt-2">
                            Present your ticket QR code to venue staff to redeem
                            perks
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Collectible Poster Section - Revealed */}
                  {ticket.isRevealed &&
                    ticket.posterImageUrl && (
                      <div className="pt-4 border-t border-grit-500/30">
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-resistance-500/10 via-hack-green/10 to-acid-400/10 p-4 rounded-lg border border-acid-400/30">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🎨</span>
                                <h4 className="font-semibold text-acid-400">
                                  Collectible Poster
                                </h4>
                              </div>
                              {ticket.rarityMultiplier && (
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${getRarityColor(ticket.rarityMultiplier)}`}>
                                    {getRarityLabel(ticket.rarityMultiplier)}
                                  </span>
                                  <span className="text-xs text-grit-400">
                                    {ticket.rarityMultiplier}x
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-ink-800">
                              <Image
                                src={ticket.posterImageUrl}
                                alt={`${ticket.eventTitle} Collectible Poster`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-bone-100 font-medium">
                                Proof of Attendance Verified
                              </p>
                              <p className="text-xs text-grit-300">
                                This exclusive {ticket.tier} collectible commemorates
                                your attendance at {ticket.eventTitle}.
                              </p>
                              {ticket.rarityMultiplier && ticket.rarityMultiplier > 1.0 && (
                                <p className="text-xs text-acid-400">
                                  This is a {getRarityLabel(ticket.rarityMultiplier)} tier
                                  collectible with a {ticket.rarityMultiplier}x rarity multiplier,
                                  making it more valuable than standard editions.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Unrevealed Collectible Teaser - Active tickets */}
                  {!ticket.isRevealed &&
                    ticket.onChainState === "ACTIVE" &&
                    ticket.status === "active" && (
                      <div className="pt-4 border-t border-grit-500/30">
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 rounded-lg border border-indigo-500/30">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                              <span className="text-xl">🔒</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-indigo-400 text-sm">
                                Collectible Poster Locked
                              </h4>
                              <p className="text-xs text-grit-400">
                                Attend event to unlock
                              </p>
                            </div>
                          </div>
                          <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <div className="text-4xl opacity-30">🎨</div>
                              <p className="text-sm text-indigo-300 font-medium">
                                Exclusive {ticket.tier} Poster
                              </p>
                              <p className="text-xs text-grit-400">
                                Reveals after check-in
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-grit-300">
                            Your ticket includes an exclusive collectible concert poster
                            that will be revealed when you attend this event. Tier-specific
                            artwork with proof-of-attendance verification.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* QR Code Section - Only for active tickets */}
                  {ticket.status === "active" &&
                    ticket.onChainState !== "SOUVENIR" && (
                      <div className="pt-4 border-t border-grit-500/30">
                        {openQRCodes[ticket.id] ? (
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
                              onClick={() =>
                                setOpenQRCodes((prev) => ({
                                  ...prev,
                                  [ticket.id]: false,
                                }))
                              }
                            >
                              Hide QR Code
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full"
                            onClick={() =>
                              setOpenQRCodes((prev) => ({
                                ...prev,
                                [ticket.id]: true,
                              }))
                            }
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
              About Your NFT Tickets & Collectibles
            </h3>
            <ul className="space-y-2 text-sm text-grit-300">
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>
                  Your tickets are NFTs stored on the Base blockchain and
                  secured by your wallet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>
                  Show the QR code at the venue entrance for verification and
                  check-in.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>
                  When you attend an event, your ticket transforms into a
                  collectible concert poster NFT with proof-of-attendance
                  verification.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>
                  Higher tier tickets (Premium, VIP) unlock more valuable
                  collectibles with increased rarity multipliers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-acid-400 mt-0.5">•</span>
                <span>
                  Tickets can be transferred to other wallets if you need to
                  give them to someone else.
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
