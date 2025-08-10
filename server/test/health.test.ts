import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app';

describe('health endpoint', () => {
  it('returns ok: true', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

