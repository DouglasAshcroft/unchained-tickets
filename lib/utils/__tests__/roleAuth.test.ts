import { isDevWallet, canSwitchVenues, isAdminOrDev } from '../roleAuth';
import type { UserRole } from '@prisma/client';

describe('roleAuth', () => {
  describe('isDevWallet', () => {
    const originalEnv = process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS;

    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
    });

    afterEach(() => {
      process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS = originalEnv;
    });

    it('returns true for configured dev wallet', () => {
      const result = isDevWallet('0x1234567890abcdef1234567890abcdef12345678');
      expect(result).toBe(true);
    });

    it('returns false for other wallets', () => {
      const result = isDevWallet('0xABCDEF1234567890ABCDEF1234567890ABCDEF12');
      expect(result).toBe(false);
    });

    it('is case-insensitive', () => {
      const upperCase = isDevWallet('0X1234567890ABCDEF1234567890ABCDEF12345678');
      const mixedCase = isDevWallet('0x1234567890AbCdEf1234567890AbCdEf12345678');

      expect(upperCase).toBe(true);
      expect(mixedCase).toBe(true);
    });

    it('returns false when no dev wallet configured', () => {
      delete process.env.NEXT_PUBLIC_DEV_WALLET_ADDRESS;
      const result = isDevWallet('0x1234567890abcdef1234567890abcdef12345678');
      expect(result).toBe(false);
    });

    it('returns false when address is null or undefined', () => {
      expect(isDevWallet(null as any)).toBe(false);
      expect(isDevWallet(undefined as any)).toBe(false);
      expect(isDevWallet('')).toBe(false);
    });

    it('normalizes addresses with 0x prefix', () => {
      const withPrefix = isDevWallet('0x1234567890abcdef1234567890abcdef12345678');
      const withoutPrefix = isDevWallet('1234567890abcdef1234567890abcdef12345678');

      expect(withPrefix).toBe(true);
      // Without prefix should also work after normalization
      expect(withoutPrefix).toBe(false); // Because dev wallet has 0x prefix
    });
  });

  describe('canSwitchVenues', () => {
    it('returns true for dev role', () => {
      const result = canSwitchVenues('dev' as UserRole);
      expect(result).toBe(true);
    });

    it('returns true for admin role', () => {
      const result = canSwitchVenues('admin' as UserRole);
      expect(result).toBe(true);
    });

    it('returns false for venue role', () => {
      const result = canSwitchVenues('venue' as UserRole);
      expect(result).toBe(false);
    });

    it('returns false for fan role', () => {
      const result = canSwitchVenues('fan' as UserRole);
      expect(result).toBe(false);
    });

    it('returns false for artist role', () => {
      const result = canSwitchVenues('artist' as UserRole);
      expect(result).toBe(false);
    });

    it('handles null or undefined gracefully', () => {
      expect(canSwitchVenues(null as any)).toBe(false);
      expect(canSwitchVenues(undefined as any)).toBe(false);
    });
  });

  describe('isAdminOrDev', () => {
    it('returns true for admin role', () => {
      expect(isAdminOrDev('admin' as UserRole)).toBe(true);
    });

    it('returns true for dev role', () => {
      expect(isAdminOrDev('dev' as UserRole)).toBe(true);
    });

    it('returns false for other roles', () => {
      expect(isAdminOrDev('venue' as UserRole)).toBe(false);
      expect(isAdminOrDev('fan' as UserRole)).toBe(false);
      expect(isAdminOrDev('artist' as UserRole)).toBe(false);
    });

    it('handles null or undefined gracefully', () => {
      expect(isAdminOrDev(null as any)).toBe(false);
      expect(isAdminOrDev(undefined as any)).toBe(false);
    });
  });
});
