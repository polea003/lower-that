import { describe, it, expect, vi, beforeEach } from 'vitest';

const originalEnv = { ...process.env };
const remote = vi.hoisted(() => ({
  sendKey: vi.fn(),
  wakeTV: vi.fn(),
  ctor: vi.fn(),
}));

vi.mock('samsung-tv-remote', () => ({
  SamsungTvRemote: function () { remote.ctor(); return { sendKey: remote.sendKey, wakeTV: remote.wakeTV }; },
  Keys: { KEY_MUTE: 'KEY_MUTE' },
}));

describe('services/tvRemoteService', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv,
      OPENAI_API_KEY: 'x',
      SAMSUNG_TV_IP_ADDRESS: '1.2.3.4',
      SAMSUNG_TV_MAC_ADDRESS: 'aa:bb:cc:dd:ee:ff',
    };
    remote.sendKey.mockReset();
    remote.wakeTV.mockReset();
    remote.ctor.mockReset();
  });

  it('toggles mute successfully', async () => {
    remote.sendKey.mockResolvedValue();
    const { tvRemoteService } = await import('../src/services/tvRemoteService.js');
    await expect(tvRemoteService.toggleMute()).resolves.not.toThrow();
    expect(remote.ctor).toHaveBeenCalled();
    expect(remote.sendKey).toHaveBeenCalledWith('KEY_MUTE');
  });

  it('propagates errors with typed name on toggleMute', async () => {
    remote.sendKey.mockRejectedValue(new Error('boom'));
    const { tvRemoteService } = await import('../src/services/tvRemoteService.js');
    await expect(tvRemoteService.toggleMute()).rejects.toHaveProperty('name', 'TvRemoteError');
  });

  it('wakes TV successfully', async () => {
    remote.wakeTV.mockResolvedValue();
    const { tvRemoteService } = await import('../src/services/tvRemoteService.js');
    await expect(tvRemoteService.wakeUp()).resolves.not.toThrow();
    expect(remote.wakeTV).toHaveBeenCalled();
  });

  it('propagates errors with typed name on wakeUp', async () => {
    remote.wakeTV.mockRejectedValue(new Error('down'));
    const { tvRemoteService } = await import('../src/services/tvRemoteService.js');
    await expect(tvRemoteService.wakeUp()).rejects.toHaveProperty('name', 'TvRemoteError');
  });
});
