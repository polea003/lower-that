const getLogLevel = () => process.env.LOG_LEVEL || 'info';

const createTimestamp = () => new Date().toISOString();

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

const shouldLog = (requiredLevel, currentLevel) =>
  levels[currentLevel] >= levels[requiredLevel];

const format = (level, message, args) => {
  const timestamp = createTimestamp();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  return args.length > 0 ? [prefix, message, ...args] : [prefix, message];
};

const baseLog = (level, message, ...args) => {
  if (!shouldLog(level, getLogLevel())) return;
  console.log(...format(level, message, args));
};

export const logger = {
  info: (message, ...args) => baseLog('info', message, ...args),
  error: (message, ...args) => baseLog('error', message, ...args),
  warn: (message, ...args) => baseLog('warn', message, ...args),
  debug: (message, ...args) => baseLog('debug', message, ...args)
};
