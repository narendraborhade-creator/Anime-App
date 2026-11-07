# Sentinel's Journal

## 2026-03-06 - Upstream API Proxy Parameter Injection
**Vulnerability:** Unvalidated user inputs (`req.query.id` and `req.params.id`) were interpolated directly into external API request URLs in Express proxy routes (`/episodes` and `/anime/:id`), enabling path traversal and Server-Side Request Forgery (SSRF) against upstream services.
**Learning:** In proxy or wrapper backends that query external microservices or 3rd-party REST APIs, developers often assume client query/path parameters are harmless or already structured as expected. When parameters are concatenated or templated into target URLs without type/format validation or strict whitelisting, attackers can traverse API paths, alter query scopes, or reach unintended upstream endpoints.
**Prevention:** Strictly validate data types and structures at the edge (e.g. verifying IDs strictly match `/^\d+$/` for numeric IDs) and URL-encode path segments before constructing outbound requests to upstream services.
