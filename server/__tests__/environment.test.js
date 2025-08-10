import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('config/environment', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('validates required environment variables', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.SAMSUNG_TV_IP_ADDRESS = '1.2.3.4';
    process.env.SAMSUNG_TV_MAC_ADDRESS = 'aa:bb:cc:dd:ee:ff';
    const { environment } = await import('../src/config/environment.js');
    expect(() => environment.validate()).not.toThrow();
    expect(environment.openai.apiKey).toBe('test-key');
    expect(environment.samsung.ipAddress).toBe('1.2.3.4');
  });

  it('throws when a required env var is missing', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Prevent dotenv from loading local .env, so our deletions stick
    vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
    delete process.env.OPENAI_API_KEY;
    process.env.SAMSUNG_TV_IP_ADDRESS = '1.2.3.4';
    process.env.SAMSUNG_TV_MAC_ADDRESS = 'aa:bb:cc:dd:ee:ff';
    const { environment } = await import('../src/config/environment.js');
    expect(() => environment.validate()).toThrow(/OPENAI_API_KEY/);
    logSpy.mockRestore();
  });
});
