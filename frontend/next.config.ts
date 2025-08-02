import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // allow production builds even if there are lint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
