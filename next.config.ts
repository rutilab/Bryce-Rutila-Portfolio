import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/case-studies/node-ai-assistant',
        destination: '/case-studies/finding-focus-ai-assistant',
        permanent: true,
      },
      // The Projects page and its folders are retired (see src/app/_archive);
      // their old addresses land on the home page's Selected work instead
      ...['/case-studies', '/case-studies/finding-focus', '/case-studies/personal-projects', '/case-studies/lastinger-center'].map(
        (source) => ({ source, destination: '/#work', permanent: false }),
      ),
    ];
  },
  experimental: {
    // Disable lightningcss to avoid ARM64 binary issue in dev environment
    cssChunking: false,
  },
};

export default nextConfig;
