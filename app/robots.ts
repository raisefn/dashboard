import type { MetadataRoute } from "next";

const SITE = "https://www.raisefn.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // App / authenticated surfaces — never index per-user state
          "/brain/deploy",
          // API proxies (rewrites to brain on Railway)
          "/api/",
          "/brain/api/",
          "/v1/",
          // Auth flows
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
