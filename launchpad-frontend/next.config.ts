import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Produces a self-contained server.js for Docker (no node_modules in image)
  output: "standalone",

  // Type-checking is enforced by the CI lint job (tsc --noEmit).
  // Skipping it here prevents false failures from missing NEXT_PUBLIC_* env
  // vars at Docker image build time.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
