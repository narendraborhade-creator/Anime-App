import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';

const TEST_PORT = 5001;
const baseUrl = `http://localhost:${TEST_PORT}`;
let serverProcess: ChildProcess | null = null;

before(async () => {
  await new Promise<void>((resolve, reject) => {
    const env = { ...process.env, PORT: String(TEST_PORT) };
    const server = spawn('node', ['anime-stream/backend/server.js'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    serverProcess = server;

    server.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      if (output.includes('Anime Stream Backend running')) {
        resolve();
      }
    });

    server.stderr?.on('data', (data: Buffer) => {
      console.error(data.toString());
    });

    server.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => {
      reject(new Error('Server start timed out'));
    }, 5000);
  });
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('GET /episodes rejects path traversal payload', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=../../evil`);
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /episodes rejects non-numeric string', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=abc`);
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /episodes rejects negative id', async () => {
  const res = await fetch(`${baseUrl}/episodes?id=-5`);
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, 'Invalid anime ID. ID must be a positive integer.');
});

test('GET /anime/:id rejects path traversal / non-numeric string', async () => {
  const res = await fetch(`${baseUrl}/anime/attacker.com%2Fevil`);
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, 'Invalid anime ID. ID must be a positive integer.');
});
