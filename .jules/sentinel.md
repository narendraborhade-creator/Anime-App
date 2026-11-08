# Sentinel Security Journal

## 2026-03-06 - Unvalidated Upstream Proxy Parameter SSRF & Path Traversal Pattern
**Vulnerability:** In backend API proxies (such as `anime-stream/backend/server.js`), parameters like `id` and `q` were interpolated directly into upstream URLs (`${JIKAN_BASE}/anime/${id}`) without strict type/format checks. Unsanitized input could lead to upstream path traversal (e.g., `id=../other-endpoint`) or potential SSRF/DoS risks.
**Learning:** Even when consuming a third-party read-only REST API, backend proxy endpoints act as an unauthenticated gateway. Upstream path parameters must be strictly validated against positive integer patterns (`/^\d+$/`) and query strings must enforce length boundaries before dispatching outbound HTTP requests.
**Prevention:** Always validate format and bounds for all proxy parameters at the controller boundary before invoking external HTTP libraries like `axios`.
