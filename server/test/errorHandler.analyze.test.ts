import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/services/analysisService', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    analyzeContent: vi.fn().mockRejectedValue(new Error('boom')),
  };
});

describe('error middleware via analyze route', () => {
  it('handles unhandled rejection in route', async () => {
    const { default: request } = await import('supertest');
    const { createApp } = await import('../src/app');
    const app = createApp();
    const res = await request(app)
      .post('/api/analyze')
      .send({ description: 'x', imageBase64: null });
    expect(res.status).toBe(500);
  });
});

