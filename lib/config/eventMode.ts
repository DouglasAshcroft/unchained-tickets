/**
 * Event Mode Configuration
 *
 * Controls whether the app uses seed data (dev) or Serper API (prod)
 * for event listings.
 */

export type EventMode = 'seed' | 'serper' | 'hybrid';

export const EVENT_MODE = (process.env.NEXT_PUBLIC_EVENT_MODE as EventMode) || 'seed';

/**
 * Check if Serper API should be used for fetching external events
 */
export const isSerperEnabled = (): boolean => {
  return EVENT_MODE === 'serper' || EVENT_MODE === 'hybrid';
};

/**
 * Check if seed data should be shown
 */
export const isSeedMode = (): boolean => {
  return EVENT_MODE === 'seed' || EVENT_MODE === 'hybrid';
};

/**
 * Check if we're in demo/development mode (no real emails)
 */
export const isDemoMode = (): boolean => {
  return EVENT_MODE === 'seed' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
};
