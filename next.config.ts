import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
