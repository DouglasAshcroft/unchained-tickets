import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning from multiple lockfiles
  outputFileTracingRoot: "/home/dougjackson/Projects/unchained-tickets",

  // Production optimizations - use Next.js defaults for code splitting
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Let Next.js optimize these packages automatically
  experimental: {
    optimizePackageImports: ['@coinbase/onchainkit', '@tanstack/react-query', 'date-fns', 'react-hot-toast'],
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
        ],
      },
    ];
  },
};

export default nextConfig;
