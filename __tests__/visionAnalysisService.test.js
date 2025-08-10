import { describe, it, expect, vi, beforeEach } from 'vitest';

const originalEnv = { ...process.env };
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('openai', () => ({
  default: class MockOpenAI { constructor() { this.responses = { create: mocks.create }; } }
}));

describe('services/visionAnalysisService', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };
    mocks.create.mockReset();
  });

  it('analyzes content and returns parsed JSON', async () => {
    mocks.create.mockResolvedValue({ output_text: JSON.stringify({ tv_content_description: 'desc. ok?', should_mute_tv: true }) });
    const { visionAnalysisService } = await import('../src/services/visionAnalysisService.js');
    const result = await visionAnalysisService.analyzeVideoContent('BASE64', 'sports');
    expect(result.should_mute_tv).toBe(true);
    expect(mocks.create).toHaveBeenCalled();
  });

  it('supports data URL images unchanged', async () => {
    mocks.create.mockResolvedValue({ output_text: JSON.stringify({ tv_content_description: 'ok', should_mute_tv: false }) });
    const { visionAnalysisService } = await import('../src/services/visionAnalysisService.js');
    const dataUrl = 'data:image/jpeg;base64,AAAA';
    await visionAnalysisService.analyzeVideoContent(dataUrl, 'sports');
    const req = mocks.create.mock.calls[0][0];
    expect(req.input[0].content[0].image_url).toBe(dataUrl);
  });

  it('throws a typed error on API failure', async () => {
    mocks.create.mockRejectedValue(new Error('api down'));
    const { visionAnalysisService } = await import('../src/services/visionAnalysisService.js');
    await expect(visionAnalysisService.analyzeVideoContent('BASE64', 'sports')).rejects.toHaveProperty('name', 'VisionAnalysisError');
  });
});
