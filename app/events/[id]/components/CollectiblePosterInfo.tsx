import { Card } from '@/components/ui/Card';

interface TicketType {
  id: number;
  name: string;
}

interface CollectiblePosterInfoProps {
  ticketTypes: TicketType[];
}

export function CollectiblePosterInfo({
  ticketTypes,
}: CollectiblePosterInfoProps) {
  return (
    <Card className="mt-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-acid-400/10 border-indigo-500/30">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Lock Icon */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div className="flex-1">
            {/* Header */}
            <h3 className="brand-heading text-xl mb-2 text-indigo-300">
              Exclusive Collectible Concert Poster
            </h3>
            <p className="text-bone-100 mb-4">
              Your NFT ticket includes an exclusive collectible concert poster
              that reveals after you attend the event. Each ticket tier unlocks
              unique artwork with different rarity levels.
            </p>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ticketTypes && ticketTypes.length > 0 ? (
                ticketTypes.map((ticketType) => {
                  const rarityMultiplier = ticketType.name
                    .toLowerCase()
                    .includes('vip')
                    ? 2.0
                    : ticketType.name.toLowerCase().includes('premium')
                      ? 1.5
                      : 1.0;

                  const rarityLabel =
                    rarityMultiplier >= 2.0
                      ? 'VIP'
                      : rarityMultiplier >= 1.5
                        ? 'Premium'
                        : 'Standard';

                  const rarityColor =
                    rarityMultiplier >= 2.0
                      ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                      : rarityMultiplier >= 1.5
                        ? 'text-purple-400 border-purple-400/30 bg-purple-400/10'
                        : 'text-blue-400 border-blue-400/30 bg-blue-400/10';

                  return (
                    <div
                      key={ticketType.id}
                      className={`p-3 rounded-lg border ${rarityColor}`}
                    >
                      <div className="font-semibold text-sm mb-1">
                        {ticketType.name}
                      </div>
                      <div className="text-xs opacity-80">
                        {rarityLabel} • {rarityMultiplier}x Rarity
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-sm text-grit-400">
                  Tier information will be available soon
                </div>
              )}
            </div>

            {/* Info Items */}
            <div className="mt-4 pt-4 border-t border-indigo-500/20">
              <div className="flex items-center gap-2 text-sm text-grit-300">
                <svg
                  className="w-4 h-4 text-acid-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Poster reveals after event check-in (Proof of Attendance)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-grit-300 mt-2">
                <svg
                  className="w-4 h-4 text-acid-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span>Higher tiers unlock rarer, more collectible artwork</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
