import { describe, it, expect, vi, beforeEach } from 'vitest';

const originalEnv = { ...process.env };
const webcam = vi.hoisted(() => ({
  captureSpy: vi.fn(),
}));

vi.mock('node-webcam', () => ({
  default: { create: () => ({ capture: webcam.captureSpy }) },
}));

describe('services/webcamService', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    webcam.captureSpy.mockReset();
  });

  it('captures base64 frame successfully', async () => {
    webcam.captureSpy.mockImplementation((filename, cb) => cb(null, 'BASE64DATA'));
    const { webcamService } = await import('../src/services/webcamService.js');
    const base64 = await webcamService.captureFrame();
    expect(base64).toBe('BASE64DATA');
    expect(webcam.captureSpy).toHaveBeenCalled();
  });

  it('throws a typed error when capture fails', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    webcam.captureSpy.mockImplementation((filename, cb) => cb(new Error('fail')));
    const { webcamService } = await import('../src/services/webcamService.js');
    await expect(webcamService.captureFrame()).rejects.toHaveProperty('name', 'fooWebcamError');
    logSpy.mockRestore();
  });
});
