import { describe, it } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config";

describe("Security Headers Configuration", () => {
  it("should define headers function on nextConfig", async () => {
    assert.equal(typeof nextConfig.headers, "function");
    const headersConfig = await nextConfig.headers!();

    assert.equal(Array.isArray(headersConfig), true);
    assert.ok(headersConfig.length > 0);

    const rootConfig = headersConfig.find(h => h.source === "/:path*");
    assert.ok(rootConfig !== undefined);

    const headersMap = new Map(
      rootConfig!.headers.map(h => [h.key, h.value])
    );

    // Verify critical security headers
    assert.equal(headersMap.get("X-Frame-Options"), "DENY");
    assert.equal(headersMap.get("X-Content-Type-Options"), "nosniff");
    assert.equal(headersMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");
    assert.equal(headersMap.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
    assert.ok(headersMap.get("Strict-Transport-Security")?.includes("max-age="));
  });
});
