import fs from 'node:fs/promises';
import path from 'node:path';
import { ApplicationError } from '../types/index.js';

export async function saveBase64ImageToRoot(base64: string, filename = 'most_recent_capture.jpg') {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = path.resolve(process.cwd(), filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  } catch (err) {
    throw new ApplicationError('Failed to save image', 500);
  }
}

export async function latestImagePath(filename = 'most_recent_capture.jpg') {
  const filePath = path.resolve(process.cwd(), filename);
  return filePath;
}
