import test from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../../next.config";

test("next.config headers contains critical security headers", async () => {
  assert.ok(typeof nextConfig.headers === "function", "headers should be defined as a function");

  const headerConfig = await nextConfig.headers();
  assert.ok(Array.isArray(headerConfig), "headers() should return an array");

  const globalHeaders = headerConfig.find((entry) => entry.source === "/:path*");
  assert.ok(globalHeaders, "should define security headers for /:path*");

  const headerMap = new Map(
    globalHeaders.headers.map((h: { key: string; value: string }) => [h.key, h.value])
  );

  assert.equal(headerMap.get("X-Frame-Options"), "DENY");
  assert.equal(headerMap.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headerMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.ok(headerMap.get("Strict-Transport-Security")?.includes("max-age="));
  assert.ok(headerMap.get("Permissions-Policy")?.includes("camera=()"));
  assert.ok(headerMap.get("Content-Security-Policy")?.includes("default-src 'self'"));
});
