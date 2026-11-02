import type { NextConfig } from "next";

// Security headers configuration (OWASP & Next.js recommendations)
const securityHeaders = [
  // Protect against clickjacking by denying iframe embedding
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent in HTTP requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS communication
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Restrict browser features and APIs
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Defense-in-depth Content Security Policy allowing required assets and media
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' http://localhost:5000 https://api.jikan.moe https://*.mux.dev https://commondatastorage.googleapis.com;",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
