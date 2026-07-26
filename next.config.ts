import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Ensure brand assets are bundled into serverless/Docker output for AI API routes
  outputFileTracingIncludes: {
    "/api/analyze":         ["./assets/**/*", "./brand-guideline.json"],
    "/api/brand-guideline": ["./assets/**/*", "./brand-guideline.json"],
    "/api/compare":         ["./assets/**/*", "./brand-guideline.json"],
  },

  // Reduce bundle size for large icon/animation libraries by enabling tree-shaking at build time
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
