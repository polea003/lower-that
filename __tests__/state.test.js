import { describe, it, expect } from 'vitest';
import {
  createAppState,
  initializeState,
  setMuted,
  setRunning,
  stopApp,
  toggleMuteState,
  isMuted,
  isRunning,
  getContentDescription,
} from '../src/utils/state.js';

describe('utils/state', () => {
  it('initializeState sets running and content description', () => {
    const state = initializeState('sporting event');
    expect(isRunning(state)).toBe(true);
    expect(getContentDescription(state)).toBe('sporting event');
    expect(isMuted(state)).toBe(false);
  });

  it('setMuted returns new state without mutating original', () => {
    const base = createAppState();
    const next = setMuted(base, true);
    expect(next).not.toBe(base);
    expect(isMuted(next)).toBe(true);
    expect(isMuted(base)).toBe(false);
  });

  it('toggleMuteState flips mute flag', () => {
    const base = createAppState();
    const muted = toggleMuteState(base);
    expect(isMuted(muted)).toBe(true);
    const unmuted = toggleMuteState(muted);
    expect(isMuted(unmuted)).toBe(false);
  });

  it('setRunning and stopApp control lifecycle', () => {
    const base = createAppState();
    const running = setRunning(base, true);
    expect(isRunning(running)).toBe(true);
    const stopped = stopApp(running);
    expect(isRunning(stopped)).toBe(false);
  });
});

