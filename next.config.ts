import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Turbopack due to timeout issues on Vercel build
    turbopack: false,
  },
};

export default nextConfig;
