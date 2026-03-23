import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/brain/api/:path*",
        destination: "https://brain-production-61da.up.railway.app/v1/brain/:path*",
      },
      {
        source: "/v1/brain/:path*",
        destination: "https://brain-production-61da.up.railway.app/v1/brain/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map upload logs during build
  silent: true,
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
});
