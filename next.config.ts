import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/case-studies/node-ai-assistant',
        destination: '/case-studies/finding-focus-ai-assistant',
        permanent: true,
      },
    ];
  },
  experimental: {
    // Disable lightningcss to avoid ARM64 binary issue in dev environment
    cssChunking: false,
  },
};

export default nextConfig;
