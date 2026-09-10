export const DEFAULT_PORT = 3000;

export function parsePort(value) {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const port = Number(value);

  if (port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

export function getConfig(environment = process.env) {
  return {
    port: parsePort(environment.PORT),
  };
}
