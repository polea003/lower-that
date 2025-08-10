import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/services/storageService', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    saveBase64ImageToRoot: vi.fn().mockRejectedValue(new Error('disk full')),
  };
});

describe('capture endpoint error path', () => {
  it('returns 500 when saving fails', async () => {
    const { default: request } = await import('supertest');
    const { createApp } = await import('../src/app');
    const app = createApp();
    const res = await request(app)
      .post('/api/capture')
      .send({ imageBase64: 'AAAA' });
    expect(res.status).toBe(500);
  });
});
