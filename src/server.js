import { createApp } from './app.js';
import { getConfig } from './config.js';

try {
  const { port } = getConfig();
  const server = createApp();

  server.once('error', (error) => {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Invalid server configuration:', error);
  process.exitCode = 1;
}
