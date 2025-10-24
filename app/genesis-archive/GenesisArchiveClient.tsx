'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GenesisTicket {
  eventId: number;
  eventTitle: string;
  eventDate: Date;
  venueName: string;
  artistName: string;
  ticket: {
    id: string;
    status: string;
    mints: Array<{
      tokenId: string;
      txHash: string;
      mintedAt: Date;
    }>;
  };
  onChainEventId: number;
  registeredAt: Date;
}

export default function GenesisArchiveClient() {
  const [tickets, setTickets] = useState<GenesisTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGenesisTickets() {
      try {
        const response = await fetch('/api/genesis-archive');
        if (!response.ok) {
          throw new Error('Failed to fetch Genesis tickets');
        }
        const data = await response.json();
        setTickets(data.tickets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchGenesisTickets();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading Genesis Archive...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Genesis Archive</h1>
        <p className="mt-2 text-sm text-gray-700">
          The first NFT ticket minted for each event on Unchained. A historical record of every event's journey, preserved as ultra-rare soulbound collectibles.
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div>
            <span className="font-semibold text-gray-900">{tickets.length}</span>
            <span className="text-gray-600"> Genesis Tickets Minted</span>
          </div>
          <div>
            <span className="font-semibold text-purple-600">10x</span>
            <span className="text-gray-600"> Rarity Multiplier</span>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No Genesis tickets minted yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Genesis tickets are automatically minted when events are registered on-chain.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.eventId}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                      Genesis #1
                    </div>
                    <h3 className="mt-1 font-bold text-lg line-clamp-2">
                      {ticket.eventTitle}
                    </h3>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold">
                      10x
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Venue</div>
                  <div className="text-sm font-medium text-gray-900">{ticket.venueName}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Artist</div>
                  <div className="text-sm font-medium text-gray-900">{ticket.artistName}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Event Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Minted</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(ticket.registeredAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                {ticket.ticket.mints[0] && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Token ID</div>
                    <div className="text-xs font-mono text-gray-700 truncate">
                      {ticket.ticket.mints[0].tokenId.slice(0, 20)}...
                    </div>
                  </div>
                )}

                <div className="pt-3 flex gap-2">
                  <Link
                    href={`/events/${ticket.eventId}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-900 transition-colors"
                  >
                    View Event
                  </Link>
                  {ticket.ticket.mints[0]?.txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${ticket.ticket.mints[0].txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium text-white transition-colors"
                    >
                      View TX
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
