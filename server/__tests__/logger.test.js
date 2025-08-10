import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '../src/utils/logger.js';

const originalEnv = { ...process.env };
let originalLog;

describe('utils/logger', () => {
  let calls;

  beforeEach(() => {
    calls = [];
    originalLog = console.log;
    console.log = (...args) => {
      calls.push(args);
    };
  });

  afterEach(() => {
    console.log = originalLog;
    process.env = { ...originalEnv };
  });

  it('respects LOG_LEVEL=debug (logs debug/info/warn)', () => {
    process.env.LOG_LEVEL = 'debug';
    logger.debug('debug-msg', { a: 1 });
    logger.info('info-msg');
    logger.warn('warn-msg');
    expect(calls.length).toBe(3);
    // Validate shape: ["[timestamp] DEBUG:", "debug-msg", { a: 1 }]
    expect(calls[0][0]).toMatch(/\] DEBUG:/);
    expect(calls[0][1]).toBe('debug-msg');
    expect(calls[1][0]).toMatch(/\] INFO:/);
    expect(calls[1][1]).toBe('info-msg');
    expect(calls[2][0]).toMatch(/\] WARN:/);
    expect(calls[2][1]).toBe('warn-msg');
  });

  it('respects LOG_LEVEL=error (only errors)', () => {
    process.env.LOG_LEVEL = 'error';
    logger.info('ignored');
    logger.warn('ignored');
    logger.error('boom');
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toMatch(/\] ERROR:/);
    expect(calls[0][1]).toBe('boom');
  });
});
