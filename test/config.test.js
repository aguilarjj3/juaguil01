import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_PORT, getConfig, parsePort } from '../src/config.js';

test('parsePort uses the default for an unset value', () => {
  assert.equal(parsePort(undefined), DEFAULT_PORT);
  assert.equal(parsePort(''), DEFAULT_PORT);
});

test('parsePort accepts valid TCP ports', () => {
  assert.equal(parsePort('8080'), 8080);
  assert.equal(getConfig({ PORT: '4000' }).port, 4000);
});

test('parsePort rejects invalid TCP ports', () => {
  for (const value of ['0', '65536', '-1', '3.14', 'abc']) {
    assert.throws(
      () => parsePort(value),
      /PORT must be an integer between 1 and 65535/,
    );
  }
});
