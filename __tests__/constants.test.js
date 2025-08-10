import { describe, it, expect } from 'vitest';
import { WEBCAM_CONFIG, AI_CONFIG, APP_CONFIG, CONTENT_TYPES, USER_MENU_OPTIONS } from '../src/config/constants.js';

describe('config/constants', () => {
  it('exports expected constants', () => {
    expect(WEBCAM_CONFIG).toMatchObject({ WIDTH: 512, HEIGHT: 288, OUTPUT_FORMAT: 'jpeg' });
    expect(AI_CONFIG.MODEL).toBeTypeOf('string');
    expect(APP_CONFIG.CAPTURE_INTERVAL_MS).toBeGreaterThan(0);
    expect(CONTENT_TYPES.SPORTING_EVENT).toContain('sporting');
    expect(USER_MENU_OPTIONS).toMatchObject({ SPORTING_EVENT: '1', BLACK_WHITE_MOVIE: '2', CUSTOM: '3' });
  });
});

