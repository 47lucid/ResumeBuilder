import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Produces a self-contained server.js for Docker (no node_modules in image)
  output: "standalone",

  // Type-checking and linting are enforced by dedicated CI jobs (frontend-check).
  // Skipping them during `next build` keeps the Docker build lean and prevents
  // false failures caused by missing NEXT_PUBLIC_* env vars at image build time.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
