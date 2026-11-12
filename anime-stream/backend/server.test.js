const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /episodes - returns 400 when id is missing', async () => {
  const res = await fetch(`${baseUrl}/episodes`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Query parameter id is required');
});

test('GET /episodes - returns 400 for path traversal payload', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=../secret`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /episodes - returns 400 for non-numeric characters', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=abc123`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /episodes - returns 400 for negative numbers', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=-5`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /anime/:id - returns 400 for non-numeric path parameter', async () => {
  const res = await fetch(`${baseUrl}/anime/invalid-id`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /anime/:id - returns 400 for traversal attempt', async () => {
  const res = await fetch(`${baseUrl}/anime/${encodeURIComponent('../traversal')}`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /health - returns ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});
