import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../src/app';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('latest image endpoint', () => {
  const imagePath = path.resolve(process.cwd(), 'most_recent_capture.jpg');

  beforeEach(async () => {
    try {
      await fs.unlink(imagePath);
    } catch (_) {
      // ignore
    }
  });

  it('returns 404 when no image saved', async () => {
    const app = createApp();
    const res = await request(app).get('/api/image/latest');
    expect(res.status).toBe(404);
  });

  it('streams image when present', async () => {
    const app = createApp();
    const fs = await import('node:fs/promises');
    const data = Buffer.from('test');
    await fs.writeFile(imagePath, data);
    const res = await request(app).get('/api/image/latest').buffer(true);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/image\/jpeg/);
  });
});
