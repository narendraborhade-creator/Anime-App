const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('./server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
});

test('GET /episodes rejects missing anime ID with 400', async () => {
  const res = await fetch(`${baseUrl}/episodes`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid anime ID. Must be a positive integer.');
});

test('GET /episodes rejects path traversal / non-numeric anime ID with 400', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=../secret`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid anime ID. Must be a positive integer.');
});

test('GET /episodes rejects zero or negative anime ID with 400', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=-5`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid anime ID. Must be a positive integer.');
});

test('GET /anime/:id rejects non-numeric anime ID with 400', async () => {
  const res = await fetch(`${baseUrl}/anime/invalid_id`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid anime ID. Must be a positive integer.');
});

test('GET /search rejects missing q query parameter with 400', async () => {
  const res = await fetch(`${baseUrl}/search`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Query parameter q is required');
});

test('GET /search rejects whitespace-only q parameter with 400', async () => {
  const res = await fetch(`${baseUrl}/search?q=%20%20`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Query parameter q is required');
});

test('GET /search rejects oversized q parameter (>100 chars) with 400', async () => {
  const longQuery = 'a'.repeat(101);
  const res = await fetch(`${baseUrl}/search?q=${longQuery}`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Query parameter q must not exceed 100 characters');
});

test('GET /health returns 200 ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});
