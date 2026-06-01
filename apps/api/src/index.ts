import { env } from './config/env.js';
import { buildApp } from './app.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
    app.log.info(`API listening on ${env.API_BASE_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
