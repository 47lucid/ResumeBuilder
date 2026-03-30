import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Produces a self-contained server for Docker (minimal image)
  output: "standalone",
};

export default nextConfig;
