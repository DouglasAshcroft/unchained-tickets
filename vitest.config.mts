import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    reporters: [
      'default',
      [
        'junit',
        {
          outputFile: 'tests/reports/vitest-results.xml',
        },
      ],
      [
        'json',
        {
          outputFile: 'tests/reports/vitest-output.json',
        },
      ],
    ],
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_DEV_MODE: 'true',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
    },
    pool: 'threads',
    server: {
      deps: {
        inline: ['@farcaster/miniapp-sdk', '@coinbase/onchainkit'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
