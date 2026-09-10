import { createServer } from 'node:http';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    'content-length': Buffer.byteLength(body),
    'content-type': JSON_CONTENT_TYPE,
    ...headers,
  });
  response.end(body);
}

export function createApp() {
  return createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (url.pathname === '/health') {
      if (request.method !== 'GET') {
        sendJson(
          response,
          405,
          { error: 'method_not_allowed' },
          { allow: 'GET' },
        );
        return;
      }

      sendJson(response, 200, { status: 'ok' });
      return;
    }

    sendJson(response, 404, { error: 'not_found' });
  });
}
