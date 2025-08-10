import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app';

describe('analyze endpoint', () => {
  it('returns analysis result for description', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/analyze')
      .send({ description: 'loud action scene', imageBase64: null });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        description: 'loud action scene',
        verdict: expect.stringMatching(/ok|lower/i),
      })
    );
  });

  it('validates missing description', async () => {
    const app = createApp();
    const res = await request(app).post('/api/analyze').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/description/);
  });
});

