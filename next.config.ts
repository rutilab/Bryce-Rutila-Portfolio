import type { NextConfig } from 'next';
import path from 'path';
import os from 'os';

// Keep build output under ~/.cache — Desktop/iCloud folders break webpack atomic renames
// (ENOENT on *.pack.gz_, missing middleware-manifest.json).
// A node_modules symlink at the cache root lets Node.js find react/next from server bundles.
const cacheRoot = path.join(os.homedir(), '.cache', 'bar9000-next');
const distDir = path.relative(process.cwd(), path.join(cacheRoot, 'dist'));

const nextConfig: NextConfig = {
  distDir,
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
