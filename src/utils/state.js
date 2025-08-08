import { pipe, tap } from './functional.js';
import { logger } from './logger.js';

// Immutable state management using functional approach

export const createAppState = (initialState = {}) => ({
  isMuted: false,
  contentDescription: null,
  isRunning: false,
  ...initialState
});

export const updateState = (updates) => (state) => ({
  ...state,
  ...updates
});

export const getStateProperty = (property) => (state) => state[property];

export const logStateChange = tap((state) => 
  logger.debug('State updated:', state)
);

// State transition functions
export const setMuted = (isMuted) => updateState({ isMuted });
export const setContentDescription = (contentDescription) => updateState({ contentDescription });
export const setRunning = (isRunning) => updateState({ isRunning });

// State predicates
export const isMuted = getStateProperty('isMuted');
export const isRunning = getStateProperty('isRunning');
export const getContentDescription = getStateProperty('contentDescription');

// Compound state operations
export const toggleMuteState = (state) => 
  pipe(
    setMuted(!isMuted(state)),
    logStateChange
  )(state);

export const initializeState = (contentDescription) =>
  pipe(
    setContentDescription(contentDescription),
    setRunning(true),
    logStateChange
  )(createAppState());

export const stopApp = pipe(
  setRunning(false),
  logStateChange
);