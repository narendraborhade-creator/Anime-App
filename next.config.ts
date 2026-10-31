import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking by disallowing framing
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent in requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict unused browser features & APIs
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Enforce HTTPS communication
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
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
