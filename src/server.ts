
import { buildApp } from './app.js';
import { env } from './config/env.js';

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
