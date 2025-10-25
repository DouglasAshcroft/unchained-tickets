/**
 * Role Authorization Utilities
 *
 * Centralized role-based access control and permission checking.
 * Provides reusable functions for determining user capabilities
 * across the application.
 *
 * DRY Principle: Single source of truth for role-based permissions
 */

import type { UserRole } from '@prisma/client';

/**
 * Check if a wallet address matches the configured dev wallet
 *
 * @param address - Wallet address to check
 * @returns True if address matches NEXT_PUBLIC_DEV_WALLET_ADDRESS
 */
export function isDevWallet(address: string | null | undefined): boolean {
  if (!address) {
    return false;
  }

  const devWallet = process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS;
  if (!devWallet) {
    return false;
  }

  // Normalize addresses to lowercase for comparison
  const normalizedAddress = address.toLowerCase();
  const normalizedDevWallet = devWallet.toLowerCase();

  return normalizedAddress === normalizedDevWallet;
}

/**
 * Check if a user role has permission to switch between venues
 *
 * @param role - User's role
 * @returns True if user can access venue switcher
 */
export function canSwitchVenues(role: UserRole | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return role === 'admin' || role === 'dev';
}

/**
 * Check if a user role is admin or dev
 *
 * @param role - User's role
 * @returns True if user is admin or dev
 */
export function isAdminOrDev(role: UserRole | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return role === 'admin' || role === 'dev';
}

/**
 * Check if a user can manage a specific venue
 *
 * @param userRole - User's role
 * @param userVenueId - User's owned venue ID (if venue owner)
 * @param targetVenueId - Venue ID to check access for
 * @param inSupportMode - Whether user is in support mode
 * @returns True if user can manage the target venue
 */
export function canManageVenue(
  userRole: UserRole,
  userVenueId: number | null,
  targetVenueId: number,
  inSupportMode = false
): boolean {
  // Admin/Dev in support mode can manage any venue they're supporting
  if (isAdminOrDev(userRole) && inSupportMode) {
    return true;
  }

  // Venue owners can manage their own venue
  if (userRole === 'venue' && userVenueId === targetVenueId) {
    return true;
  }

  return false;
}
