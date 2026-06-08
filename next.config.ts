import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Needed for Railway: allow the server to bind to 0.0.0.0
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
