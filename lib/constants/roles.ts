export const USER_ROLES = {
  FAN: 'fan',
  ARTIST: 'artist',
  VENUE: 'venue',
  ADMIN: 'admin',
  DEV: 'dev',
} as const;

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRoleValue, string> = {
  fan: 'Fan',
  artist: 'Artist',
  venue: 'Venue',
  admin: 'Admin',
  dev: 'Developer',
};

export const RBAC = {
  venueAccess: [USER_ROLES.VENUE, USER_ROLES.ADMIN, USER_ROLES.DEV],
};
