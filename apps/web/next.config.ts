import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Ensure env vars are available at runtime where needed */
  experimental: {
    // Edge runtime routes rely on process.env at build and runtime
  },
  // Reduce duplicate invokes in dev
  reactStrictMode: false,
};

export default nextConfig;
