# juaguil01

A dependency-free HTTP API scaffold built with Node.js 24 LTS and ES
modules.

## Prerequisites

- Node.js 24 or later
- npm

## Setup

```sh
npm install
```

## Run the API

Start the server:

```sh
npm start
```

Run in watch mode during development:

```sh
npm run dev
```

The server listens on port `3000` by default. Set `PORT` to use another
TCP port:

```sh
PORT=8080 npm start
```

In PowerShell:

```powershell
$env:PORT = 8080
npm start
```

## Endpoint

`GET /health` returns:

```json
{
  "status": "ok"
}
```

Unknown routes return a JSON `404` response. Methods other than `GET` on
`/health` return `405 Method Not Allowed`.

## Quality checks

```sh
npm run lint
npm test
npm run test:coverage
```

Tests use Node.js's built-in test runner. ESLint uses its flat
configuration format.

## CI/CD

`.github/workflows/node-ci.yml` independently validates the Node.js
application with Node 24, ESLint, and the test suite.

The existing `.github/workflows/ci_process.yml` remains the authoritative
Java-oriented delivery template and is intentionally unchanged.