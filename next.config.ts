import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use a local (non-FUSE-mounted) directory for the build output
  // This avoids EPERM errors from macOS FUSE filesystem locking
  distDir: '.next',
  experimental: {
    // Disable lightningcss to avoid ARM64 binary issue in dev environment
    cssChunking: false,
  },
};

export default nextConfig;
