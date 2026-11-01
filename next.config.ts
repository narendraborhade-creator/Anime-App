import type { NextConfig } from "next";

// Security headers to harden the application against common web vulnerabilities
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" }, // Protects against clickjacking attacks
  { key: "X-Content-Type-Options", value: "nosniff" }, // Prevents MIME-sniffing
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // Protects sensitive referrer info
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }, // Restricts access to sensitive browser features
  { key: "X-XSS-Protection", value: "1; mode=block" }, // Legacy XSS filter protection
];

const nextConfig: NextConfig = {
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
