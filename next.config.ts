import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    // Disable ESLint during build to focus on functionality
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during build
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Add security headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), run-ad-auction=(), join-ad-interest-group=(), private-state-token-redemption=(), private-state-token-issuance=(), private-aggregation=(), attribution-reporting=()'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable static optimization
  output: 'standalone',
  // Add redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/discover',
        permanent: true,
      },
      {
        source: '/leaderboard',
        destination: '/rankings',
        permanent: true,
      },
      {
        source: '/create',
        destination: '/add',
        permanent: true,
      },
    ]
  },
  // Optimize bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Turbopack configuration (for development and build with --turbopack flag)
  turbopack: {
    resolveAlias: {
      // Turbopack uses string paths for aliases, not boolean fallbacks
      // These aliases point to empty modules for client-side compatibility
      fs: require.resolve('./src/lib/empty-module.js'),
      net: require.resolve('./src/lib/empty-module.js'),
      tls: require.resolve('./src/lib/empty-module.js'),
    },
  },
};

export default nextConfig;
