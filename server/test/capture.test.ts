import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../src/app';
import fs from 'node:fs/promises';
import path from 'node:path';

const samplePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHwwMDAwAAGnJD5U1b4jGAAAAAElFTkSuQmCC';

describe('capture endpoint', () => {
  const imagePathA = path.resolve(process.cwd(), 'most_recent_capture.jpg');
  const imagePathB = path.resolve(process.cwd(), '..', 'most_recent_capture.jpg');
  const statEither = async () => {
    try { return await fs.stat(imagePathA); } catch {}
    return await fs.stat(imagePathB);
  };

  beforeEach(async () => {
    for (const p of [imagePathA, imagePathB]) {
      try { await fs.unlink(p); } catch {}
    }
  });

  it('saves a base64 image to most_recent_capture.jpg', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/capture')
      .send({ imageBase64: samplePngBase64 });

    expect(res.status).toBe(201);
    expect(res.body.saved).toBe(true);

    const stat = await statEither();
    expect(stat.isFile()).toBe(true);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('validates payload and returns 400 when missing image', async () => {
    const app = createApp();
    const res = await request(app).post('/api/capture').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/imageBase64/);
  });

});
