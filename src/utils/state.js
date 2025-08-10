import { logger } from './logger.js';

// Immutable state with simple helpers

export const createAppState = (initialState = {}) => ({
  isMuted: false,
  contentDescription: null,
  isRunning: false,
  ...initialState
});

const logStateChange = (state) => {
  logger.debug('State updated:', state);
  return state;
};

export const setMuted = (state, isMuted) => logStateChange({ ...state, isMuted });
export const setContentDescription = (state, contentDescription) =>
  logStateChange({ ...state, contentDescription });
export const setRunning = (state, isRunning) => logStateChange({ ...state, isRunning });

export const isMuted = (state) => state.isMuted;
export const isRunning = (state) => state.isRunning;
export const getContentDescription = (state) => state.contentDescription;

export const toggleMuteState = (state) => setMuted(state, !state.isMuted);

export const initializeState = (contentDescription) =>
  logStateChange(createAppState({ contentDescription, isRunning: true }));

export const stopApp = (state) => setRunning(state, false);
