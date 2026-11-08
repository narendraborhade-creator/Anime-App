import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

// Import Express app from anime-stream/backend/server.js
import app from '../anime-stream/backend/server.js';

let server: http.Server;
let port: number;

function makeRequest(path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 500, body: data });
        }
      });
    }).on('error', reject);
  });
}

test('start test server', async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        port = addr.port;
      }
      resolve();
    });
  });
});

test('GET /search rejects missing q parameter', async () => {
  const res = await makeRequest('/search');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /search rejects whitespace-only q parameter', async () => {
  const res = await makeRequest('/search?q=%20%20');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /search rejects oversized q parameter (DoS risk)', async () => {
  const longQuery = 'a'.repeat(101);
  const res = await makeRequest(`/search?q=${longQuery}`);
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /episodes rejects missing id parameter', async () => {
  const res = await makeRequest('/episodes');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /episodes rejects non-numeric/path traversal id parameter', async () => {
  const res = await makeRequest('/episodes?id=../secret');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /anime/:id rejects non-numeric/path traversal id parameter', async () => {
  const res = await makeRequest('/anime/abc');
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test('GET /health endpoint continues to return 200 OK', async () => {
  const res = await makeRequest('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('close test server', async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});
