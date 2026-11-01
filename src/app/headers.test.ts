import { describe, it } from "node:test";
import assert from "node:assert";
import nextConfig from "../../next.config";

describe("Next.js Security Headers", () => {
  it("should configure security headers for all routes", async () => {
    assert(nextConfig.headers, "nextConfig.headers should be defined");

    const headersConfig = await nextConfig.headers();
    assert(Array.isArray(headersConfig), "headersConfig should be an array");
    assert(headersConfig.length > 0, "headersConfig should not be empty");

    const wildcardRoute = headersConfig.find((entry) => entry.source === "/(.*)");
    assert(wildcardRoute, "wildcard route /(.*) should be defined");

    const headerMap = new Map(
      wildcardRoute.headers.map((h) => [h.key, h.value])
    );

    assert.strictEqual(headerMap.get("X-Frame-Options"), "DENY");
    assert.strictEqual(headerMap.get("X-Content-Type-Options"), "nosniff");
    assert.strictEqual(headerMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");
    assert.strictEqual(headerMap.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
    assert.strictEqual(headerMap.get("X-XSS-Protection"), "1; mode=block");
  });
});
