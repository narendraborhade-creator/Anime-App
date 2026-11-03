const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { app, isValidAnimeId } = require('./server');

test('isValidAnimeId helper validates anime IDs correctly', () => {
  // Valid numeric IDs
  assert.strictEqual(isValidAnimeId('1'), true);
  assert.strictEqual(isValidAnimeId('21'), true);
  assert.strictEqual(isValidAnimeId('5114'), true);
  assert.strictEqual(isValidAnimeId(' 5114 '), true);

  // Invalid IDs: path traversal, zero, negative, injection, non-numeric
  assert.strictEqual(isValidAnimeId('../'), false);
  assert.strictEqual(isValidAnimeId('1/episodes'), false);
  assert.strictEqual(isValidAnimeId('0'), false);
  assert.strictEqual(isValidAnimeId('-1'), false);
  assert.strictEqual(isValidAnimeId('abc'), false);
  assert.strictEqual(isValidAnimeId('1.5'), false);
  assert.strictEqual(isValidAnimeId(''), false);
  assert.strictEqual(isValidAnimeId(null), false);
  assert.strictEqual(isValidAnimeId(undefined), false);
  assert.strictEqual(isValidAnimeId(123), false); // must be string input
});

test('HTTP endpoint validations reject invalid input with 400', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Missing query q in /search
    let res = await fetch(`${baseUrl}/search`);
    assert.strictEqual(res.status, 400);
    let body = await res.json();
    assert.match(body.error, /required/i);

    // 2. Excessively long query in /search (> 100 chars)
    const longQuery = 'a'.repeat(101);
    res = await fetch(`${baseUrl}/search?q=${longQuery}`);
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.match(body.error, /cannot exceed 100 characters/i);

    // 3. Invalid anime id in /episodes (path traversal attempt)
    res = await fetch(`${baseUrl}/episodes?id=..%2F..%2Fsecret`);
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.match(body.error, /positive integer/i);

    // 4. Missing anime id in /episodes
    res = await fetch(`${baseUrl}/episodes`);
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.match(body.error, /positive integer/i);

    // 5. Invalid anime id in /anime/:id
    res = await fetch(`${baseUrl}/anime/invalid-id`);
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.match(body.error, /positive integer/i);

    // 6. Health check succeeds
    res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    body = await res.json();
    assert.strictEqual(body.status, 'ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
