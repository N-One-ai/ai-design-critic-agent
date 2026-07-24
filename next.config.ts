import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/analyze": ["./assets/**/*", "./brand-guideline.json"],
    "/api/brand-guideline": ["./assets/**/*", "./brand-guideline.json"],
    "/api/compare": ["./assets/**/*", "./brand-guideline.json"],
  },
};

export default nextConfig;
