import { test, before, after } from "node:test";
import assert from "node:assert";
import type { Server } from "node:http";

// Import Express app from backend
import app from "../anime-stream/backend/server";

let server: Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
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

test("GET /episodes rejects path traversal attempt in id param with 400", async () => {
  const res = await fetch(`${baseUrl}/episodes?id=../secret`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Valid numeric id parameter is required");
});

test("GET /episodes rejects non-numeric id with 400", async () => {
  const res = await fetch(`${baseUrl}/episodes?id=abc`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Valid numeric id parameter is required");
});

test("GET /anime/:id rejects path traversal attempt with 400", async () => {
  const res = await fetch(`${baseUrl}/anime/..%2Fsecret`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Valid numeric id parameter is required");
});

test("GET /anime/:id rejects non-numeric id with 400", async () => {
  const res = await fetch(`${baseUrl}/anime/invalid-id`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Valid numeric id parameter is required");
});

test("GET /search rejects query exceeding max length with 400", async () => {
  const longQuery = "a".repeat(101);
  const res = await fetch(`${baseUrl}/search?q=${longQuery}`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Query parameter q is too long (max 100 characters)");
});

test("GET /search rejects empty query with 400", async () => {
  const res = await fetch(`${baseUrl}/search?q=   `);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, "Query parameter q is required");
});

test("GET /health returns 200 ok status", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, "ok");
});
