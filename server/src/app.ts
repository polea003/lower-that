import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { z } from 'zod';
import fs from 'node:fs/promises';
import { analyzeContent } from './services/analysisService.js';
import { saveBase64ImageToRoot, latestImagePath } from './services/storageService.js';
import { ApplicationError } from './types/index.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/capture', async (req, res) => {
    const schema = z.object({ imageBase64: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues ?? [];
      const msg = issues.map(e => (e.path?.join('.') || 'body') + ' ' + e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    try {
      await saveBase64ImageToRoot(parsed.data.imageBase64);
      res.status(201).json({ saved: true });
    } catch (err) {
      const status = err instanceof ApplicationError ? err.status : 500;
      res.status(status).json({ error: 'Failed to save image' });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    const schema = z.object({
      description: z.string().min(1),
      imageBase64: z.string().min(1).nullable().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues ?? [];
      const msg = issues.map(e => (e.path?.join('.') || 'body') + ' ' + e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    const result = await analyzeContent(parsed.data);
    res.json(result);
  });

  app.get('/api/image/latest', async (_req, res) => {
    const p = await latestImagePath();
    try {
      await fs.stat(p);
    } catch {
      return res.status(404).json({ error: 'No image found' });
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(p);
  });

  // Generic error handler for unhandled rejections
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // log for tests/debug
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
    const status = err instanceof ApplicationError ? err.status : 500;
    res.status(status).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  });

  return app;
}
