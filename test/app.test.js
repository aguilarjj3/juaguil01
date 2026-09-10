import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { createApp } from '../src/app.js';

async function startTestServer(testContext) {
  const server = createApp();

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  testContext.after(async () => {
    server.close();
    await once(server, 'close');
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Expected the test server to use a TCP address.');
  }

  return `http://127.0.0.1:${address.port}`;
}

test('GET /health reports service health', async (testContext) => {
  const baseUrl = await startTestServer(testContext);
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('unknown routes return a JSON 404 response', async (testContext) => {
  const baseUrl = await startTestServer(testContext);
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  assert.deepEqual(await response.json(), { error: 'not_found' });
});

test('unsupported health methods return 405', async (testContext) => {
  const baseUrl = await startTestServer(testContext);
  const response = await fetch(`${baseUrl}/health`, { method: 'POST' });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
  assert.deepEqual(await response.json(), { error: 'method_not_allowed' });
});
