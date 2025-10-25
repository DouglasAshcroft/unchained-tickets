import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence workspace root warning from multiple lockfiles while staying machine-agnostic
  outputFileTracingRoot: path.resolve(process.cwd()),

  // Production optimizations - use Next.js defaults for code splitting
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Let Next.js optimize these packages automatically
  experimental: {
    optimizePackageImports: [
      '@coinbase/onchainkit',
      '@tanstack/react-query',
      'date-fns',
      'react-hot-toast',
      'wagmi',
      'viem',
      'fuse.js'
    ],
  },

  webpack: (config) => {
    // Only keep essential externals
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Suppress MetaMask SDK warning about react-native-async-storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };

    // Ignore the async-storage module warning
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];

    // Let Next.js handle code splitting - don't override defaults
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.coinbase.com https://*.coinbase.com blob:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "unchained-tickets",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Disable sourcemap uploads until Sentry auth token is configured in Vercel
  sourcemaps: {
    disable: true,
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});