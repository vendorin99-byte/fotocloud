import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Turbopack if having timeout issues
    // turbopack: false,
  },
};

export default nextConfig;
