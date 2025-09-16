import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Ensure env vars are available at runtime where needed */
  experimental: {
    // Edge runtime routes rely on process.env at build and runtime
  },
  // Reduce duplicate invokes in dev
  reactStrictMode: false,
  // Ensure Next.js output file tracing resolves to the monorepo root
  outputFileTracingRoot: path.join(__dirname, '../../..'),
};

export default nextConfig;
