import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll } from 'vitest';

// Note: happy-dom provides its own TextEncoder/TextDecoder, so we don't need polyfills

// Setup localStorage mock for tests
beforeAll(() => {
  const localStorageMock = {
    getItem: vi.fn((_key: string) => null),
    setItem: vi.fn((_key: string, _value: string) => {}),
    removeItem: vi.fn((_key: string) => {}),
    clear: vi.fn(() => {}),
    length: 0,
    key: vi.fn((_index: number) => null),
  };

  global.localStorage = localStorageMock as any;
});

// Mock Next.js modules that aren't available in test environment
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
