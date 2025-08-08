class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  _log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
    
    if (args.length > 0) {
      console.log(prefix, message, ...args);
    } else {
      console.log(prefix, message);
    }
  }

  info(message, ...args) {
    this._log('info', message, ...args);
  }

  error(message, ...args) {
    this._log('error', message, ...args);
  }

  warn(message, ...args) {
    this._log('warn', message, ...args);
  }

  debug(message, ...args) {
    if (this.logLevel === 'debug') {
      this._log('debug', message, ...args);
    }
  }
}

export const logger = new Logger();