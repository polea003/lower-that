import { curry } from './functional.js';

const getLogLevel = () => process.env.LOG_LEVEL || 'info';

const createTimestamp = () => new Date().toISOString();

const formatLogMessage = curry((level, message, args) => {
  const timestamp = createTimestamp();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  return args.length > 0 ? [prefix, message, ...args] : [prefix, message];
});

const shouldLog = curry((requiredLevel, currentLevel) => {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  return levels[currentLevel] >= levels[requiredLevel];
});

const logToConsole = (formattedMessage) => {
  console.log(...formattedMessage);
  return formattedMessage;
};

const createLogger = (level) => curry((logLevel, message, ...args) => {
  if (shouldLog(logLevel)(getLogLevel())) {
    const formatted = formatLogMessage(logLevel, message, args);
    return logToConsole(formatted);
  }
});

const log = createLogger();

export const logger = {
  info: log('info'),
  error: log('error'),
  warn: log('warn'),
  debug: log('debug')
};