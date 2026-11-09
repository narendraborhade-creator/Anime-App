const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { app, isValidAnimeId } = require('./server');

test('isValidAnimeId unit test', () => {
  assert.strictEqual(isValidAnimeId('123'), true);
  assert.strictEqual(isValidAnimeId('1'), true);
  assert.strictEqual(isValidAnimeId('0'), true);
  assert.strictEqual(isValidAnimeId(' 456 '), true);

  // Invalid IDs: path traversal, negative, non-numeric, objects, etc.
  assert.strictEqual(isValidAnimeId('../123'), false);
  assert.strictEqual(isValidAnimeId('123/episodes'), false);
  assert.strictEqual(isValidAnimeId('-1'), false);
  assert.strictEqual(isValidAnimeId('abc'), false);
  assert.strictEqual(isValidAnimeId('12a3'), false);
  assert.strictEqual(isValidAnimeId(''), false);
  assert.strictEqual(isValidAnimeId('   '), false);
  assert.strictEqual(isValidAnimeId(null), false);
  assert.strictEqual(isValidAnimeId(undefined), false);
  assert.strictEqual(isValidAnimeId(123), false);
});

test('Express endpoints input validation integration', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Missing or invalid id on /episodes
    const resNoId = await fetch(`${baseUrl}/episodes`);
    assert.strictEqual(resNoId.status, 400);

    const resTraversal = await fetch(`${baseUrl}/episodes?id=../secret`);
    assert.strictEqual(resTraversal.status, 400);

    const resAlpha = await fetch(`${baseUrl}/episodes?id=abc`);
    assert.strictEqual(resAlpha.status, 400);

    // 2. Missing or invalid id on /anime/:id
    const resAnimeTraversal = await fetch(`${baseUrl}/anime/..%2Fsecret`);
    assert.strictEqual(resAnimeTraversal.status, 400);

    const resAnimeAlpha = await fetch(`${baseUrl}/anime/abc`);
    assert.strictEqual(resAnimeAlpha.status, 400);

    // 3. Search query validation
    const resSearchEmpty = await fetch(`${baseUrl}/search`);
    assert.strictEqual(resSearchEmpty.status, 400);

    const longQuery = 'a'.repeat(101);
    const resSearchTooLong = await fetch(`${baseUrl}/search?q=${longQuery}`);
    assert.strictEqual(resSearchTooLong.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
