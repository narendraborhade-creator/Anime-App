# Sentinel Security Journal

## 2026-03-06 - Upstream API Parameter Injection and Path Traversal
**Vulnerability:** Express proxy endpoints (`/episodes?id=`, `/anime/:id`) interpolated user-supplied ID values directly into upstream URLs (`${JIKAN_BASE}/anime/${id}/episodes`). Malformed inputs containing path traversal sequences or special characters could manipulate upstream request paths and query parameters.
**Learning:** Proxy services communicating with 3rd-party REST APIs must strictly validate path parameters against expected schemas (e.g. positive integer IDs) before interpolating them into outbound request URLs, even when the 3rd-party API has its own validation.
**Prevention:** Always validate ID parameters with strict regex/integer format checks (`/^[1-9]\d{0,9}$/`) and enforce length limits on freeform search queries before issuing upstream HTTP requests.
