const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server');

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('GET /search returns 400 when q is missing or empty', async () => {
  const resEmpty = await fetch(`${baseUrl}/search?q=`);
  assert.strictEqual(resEmpty.status, 400);
  const data = await resEmpty.json();
  assert.strictEqual(data.error, 'Query parameter q is required');

  const resMissing = await fetch(`${baseUrl}/search`);
  assert.strictEqual(resMissing.status, 400);
});

test('GET /search returns 400 when q exceeds maximum length', async () => {
  const longQuery = 'a'.repeat(101);
  const res = await fetch(`${baseUrl}/search?q=${longQuery}`);
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.error, 'Query parameter q must not exceed 100 characters');
});

test('GET /episodes returns 400 for missing or invalid anime id', async () => {
  const resMissing = await fetch(`${baseUrl}/episodes`);
  assert.strictEqual(resMissing.status, 400);
  const dataMissing = await resMissing.json();
  assert.strictEqual(dataMissing.error, 'Query parameter id is required');

  const invalidIds = ['abc', '-5', '0', '../admin', '1;DROP TABLE users;'];
  for (const badId of invalidIds) {
    const res = await fetch(`${baseUrl}/episodes?id=${encodeURIComponent(badId)}`);
    assert.strictEqual(res.status, 400, `Expected 400 for id: ${badId}`);
    const data = await res.json();
    assert.strictEqual(data.error, 'Query parameter id must be a valid positive integer');
  }
});

test('GET /anime/:id returns 400 for invalid anime id', async () => {
  const invalidIds = ['abc', '-1', '0', 'test'];
  for (const badId of invalidIds) {
    const res = await fetch(`${baseUrl}/anime/${badId}`);
    assert.strictEqual(res.status, 400, `Expected 400 for id: ${badId}`);
    const data = await res.json();
    assert.strictEqual(data.error, 'Anime ID must be a valid positive integer');
  }
});
