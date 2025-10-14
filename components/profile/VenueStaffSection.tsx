'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VenueStaffSectionProps {
  memberships: Array<{
    id: number;
    role: string;
    venueId: number;
    isActive: boolean;
    createdAt: string;
    venue: {
      id: number;
      name: string;
      slug: string;
      city: string | null;
      state: string | null;
      imageUrl: string | null;
    };
  }>;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  SCANNER: 'Scanner',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  MANAGER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  STAFF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SCANNER: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function VenueStaffSection({ memberships }: VenueStaffSectionProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const canManageStaff = (role: string) => {
    return role === 'OWNER' || role === 'MANAGER';
  };

  return (
    <div className="space-y-6">
      {/* Venue Memberships */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1 text-bone-100">Venue Staff Access</h2>
          <p className="text-sm text-grit-300">
            Venues where you have staff privileges
          </p>
        </div>

        <div className="space-y-4">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="bg-ink-700 border border-grit-500/30 rounded-lg p-4 hover:border-grit-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Venue Image/Icon */}
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-resistance-500 to-acid-400 flex items-center justify-center text-2xl font-bold flex-shrink-0 text-bone-100">
                    {membership.venue.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={membership.venue.imageUrl}
                        alt={membership.venue.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      membership.venue.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Venue Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/venues/${membership.venue.slug}`}
                      className="text-lg font-semibold hover:text-acid-400 transition-colors text-bone-100"
                    >
                      {membership.venue.name}
                    </Link>
                    {membership.venue.city && (
                      <p className="text-sm text-grit-400 mt-1">
                        {membership.venue.city}
                        {membership.venue.state && `, ${membership.venue.state}`}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          ROLE_COLORS[membership.role] ||
                          'bg-grit-600/20 text-grit-400 border-grit-600/30'
                        }`}
                      >
                        {ROLE_LABELS[membership.role] || membership.role}
                      </span>
                      <span className="text-xs text-grit-500">
                        Since{' '}
                        {new Date(membership.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Link
                    href={`/staff/venues/${membership.venueId}`}
                    className="px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg text-sm font-medium transition-all text-center text-bone-100"
                  >
                    Manage
                  </Link>
                  {canManageStaff(membership.role) && (
                    <button
                      onClick={() => {
                        setShowInviteModal(true);
                      }}
                      className="px-4 py-2 bg-ink-600 hover:bg-grit-500 border border-grit-500/30 rounded-lg text-sm font-medium transition-all text-bone-100"
                    >
                      Invite Staff
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Permissions Info */}
      <div className="bg-ink-800/50 border border-grit-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-bone-100">Staff Role Permissions</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS.OWNER} mr-3 mt-0.5`}
            >
              Owner
            </span>
            <p className="text-sm text-bone-100 flex-1">
              Full access to all venue settings, staff management, and analytics
            </p>
          </div>
          <div className="flex items-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS.MANAGER} mr-3 mt-0.5`}
            >
              Manager
            </span>
            <p className="text-sm text-bone-100 flex-1">
              Can manage events, invite staff, and view analytics
            </p>
          </div>
          <div className="flex items-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS.STAFF} mr-3 mt-0.5`}
            >
              Staff
            </span>
            <p className="text-sm text-bone-100 flex-1">
              Can manage events and scan tickets at the door
            </p>
          </div>
          <div className="flex items-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS.SCANNER} mr-3 mt-0.5`}
            >
              Scanner
            </span>
            <p className="text-sm text-bone-100 flex-1">
              Can only scan and validate tickets at events
            </p>
          </div>
        </div>
      </div>

      {/* Invite Modal (placeholder) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-800 border border-grit-500/30 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-bone-100">Invite Staff Member</h3>
            <p className="text-sm text-grit-400 mb-4">
              Staff invitation system coming soon. For now, contact support to add staff members.
            </p>
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full px-4 py-2 bg-resistance-500 hover:brightness-110 rounded-lg font-medium transition-all text-bone-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
