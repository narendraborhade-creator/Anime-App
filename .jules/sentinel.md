# Sentinel Journal - Critical Learnings

## 2025-02-17 - Upstream API Proxy SSRF and Path Traversal Risks
**Vulnerability:** In backend API proxies (`anime-stream/backend/server.js`), unvalidated user-supplied route parameters and query strings (e.g., `req.query.id`, `req.params.id`) were concatenated directly into upstream third-party URLs (`${JIKAN_BASE}/anime/${id}/episodes`). Furthermore, internal `error.message` strings were returned in 500 error responses.
**Learning:** Even simple API proxies need strict type and regex whitelisting (`/^\d+$/`) before interpolating params into upstream requests, and should never echo internal exception messages back to clients.
**Prevention:** Always whitelist inputs using regex constraints before interpolating into outgoing HTTP URLs, encode URL path segments (`encodeURIComponent`), and return generic sanitized error responses.
