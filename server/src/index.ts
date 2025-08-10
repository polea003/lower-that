import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(ENV.PORT, () => {
  logger.info(`Server listening on http://localhost:${ENV.PORT}`);
});

