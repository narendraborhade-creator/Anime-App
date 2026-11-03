# Sentinel's Journal

## 2026-11-03 - Backend API Proxy Path Traversal / Upstream URL Manipulation Prevention
**Vulnerability:** In `anime-stream/backend/server.js`, route parameters (`id` in `/anime/:id` and `/episodes?id=`) were directly interpolated into upstream API URLs (`https://api.jikan.moe/v4/anime/${id}/episodes`) without validation or sanitization, exposing the proxy service to path manipulation, SSRF risks, or injection against upstream resources. Additionally, search queries lacked length constraints, posing DoS/resource exhaustion risks.
**Learning:** Microservice proxy backends often assume user input is well-behaved since the frontend is trusted. However, any client can issue arbitrary HTTP requests directly to backend endpoints, bypassing frontend UI logic.
**Prevention:** Strictly validate route and query parameters on backend proxy endpoints before constructing upstream requests (e.g. validate integer IDs with regex/whitelisting and encode URL components).
