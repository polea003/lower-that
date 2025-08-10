type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.LOG_LEVEL as Level) || 'info';

const enabled = (lvl: Level) => levelOrder[lvl] >= levelOrder[envLevel];

export const logger = {
  debug: (...args: unknown[]) => enabled('debug') && console.debug('[debug]', ...args),
  info: (...args: unknown[]) => enabled('info') && console.info('[info]', ...args),
  warn: (...args: unknown[]) => enabled('warn') && console.warn('[warn]', ...args),
  error: (...args: unknown[]) => enabled('error') && console.error('[error]', ...args),
};

