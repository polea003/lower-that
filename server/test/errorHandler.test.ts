import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app';

describe('error handler', () => {
  it('catches unhandled errors and returns 500', async () => {
    const app = createApp();
    // inject a route that throws to trigger the error middleware
    app.get('/boom', () => {
      throw new Error('boom');
    });
    const res = await request(app).get('/boom');
    expect(res.status).toBe(500);
  });
});
