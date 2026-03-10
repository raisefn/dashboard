import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/brain/api/:path*",
        destination: "https://brain-production-61da.up.railway.app/v1/brain/:path*",
      },
      {
        source: "/brain/deploy",
        destination: "https://brain-production-61da.up.railway.app/v1/chat",
      },
      {
        source: "/v1/brain/:path*",
        destination: "https://brain-production-61da.up.railway.app/v1/brain/:path*",
      },
    ];
  },
};

export default nextConfig;
