# Sentinel Journal

## 2025-05-18 - Parameter Interpolation into Upstream API URL (SSRF & Path Traversal)
**Vulnerability:** User-controlled parameters (`req.query.id` and `req.params.id`) were directly interpolated into upstream HTTP request URLs (`${JIKAN_BASE}/anime/${id}/episodes`) without validation or sanitization, potentially allowing path traversal or arbitrary endpoint probing on the upstream service. Additionally, unsanitized query parameters allowed unbound query lengths.
**Learning:** In proxy-style backends forwarding requests to third-party APIs, lack of strict format validation on input parameters creates path traversal / SSRF vectors. Relying on default string coercion allows attackers to inject path separators (`../`) or query separators.
**Prevention:** Strictly validate identifier inputs using positive regex assertions (`/^\d+$/`) before passing them to external API endpoints, encode URL components with `encodeURIComponent`, and impose length limits on search queries.
