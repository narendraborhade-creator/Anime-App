import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../anime-stream/backend/server.js";

let server: http.Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (typeof address === "object" && address !== null) {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("GET /episodes rejects path traversal and non-numeric IDs with 400", async () => {
  const malformedInputs = [
    "../evil",
    "../../etc/passwd",
    "123;DROP TABLE",
    "abc",
    "-5",
    "1.5",
  ];

  for (const id of malformedInputs) {
    const res = await fetch(`${baseUrl}/episodes?id=${encodeURIComponent(id)}`);
    assert.strictEqual(
      res.status,
      400,
      `Expected 400 for malicious id "${id}", got ${res.status}`
    );
    const body = (await res.json()) as { error?: string };
    assert.match(body.error || "", /must be a positive integer/i);
  }
});

test("GET /episodes requires id query param", async () => {
  const res = await fetch(`${baseUrl}/episodes`);
  assert.strictEqual(res.status, 400);
  const body = (await res.json()) as { error?: string };
  assert.match(body.error || "", /required/i);
});

test("GET /anime/:id rejects non-numeric IDs with 400", async () => {
  const malformedIds = ["evil", "../traversal", "123a", "-1"];
  for (const id of malformedIds) {
    const res = await fetch(`${baseUrl}/anime/${encodeURIComponent(id)}`);
    assert.strictEqual(
      res.status,
      400,
      `Expected 400 for malformed route param "${id}", got ${res.status}`
    );
    const body = (await res.json()) as { error?: string };
    assert.match(body.error || "", /must be a positive integer/i);
  }
});

test("GET /search rejects excessively long query strings with 400", async () => {
  const longQuery = "a".repeat(101);
  const res = await fetch(`${baseUrl}/search?q=${longQuery}`);
  assert.strictEqual(res.status, 400);
  const body = (await res.json()) as { error?: string };
  assert.match(body.error || "", /100 characters or less/i);
});

test("GET /health responds with 200 OK", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const body = (await res.json()) as { status?: string };
  assert.strictEqual(body.status, "ok");
});
