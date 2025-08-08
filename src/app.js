import { environment } from './config/environment.js';
import { APP_CONFIG } from './config/constants.js';
import { logger } from './utils/logger.js';
import { userPrompts } from './ui/userPrompts.js';
import { webcamService } from './services/webcamService.js';
import { visionAnalysisService } from './services/visionAnalysisService.js';
import { tvRemoteService } from './services/tvRemoteService.js';
import { curry, tap, tryCatch, delay, asyncPipe } from './utils/functional.js';
import {
  createAppState,
  initializeState,
  stopApp,
  setMuted,
  isMuted,
  isRunning,
  getContentDescription
} from './utils/state.js';

const createApplicationError = (message, cause) => {
  const error = new Error(message);
  error.name = 'ApplicationError';
  error.cause = cause;
  return error;
};

// Pure functions for application logic
const validateEnvironment = () => {
  logger.info('Validating environment...');
  environment.validate();
  return true;
};

const logAppStart = tap(() => logger.info('Starting Lower That application...'));
const logAppInitialized = tap(() => logger.info('Application initialized successfully'));
const logLoopStart = tap(() => logger.info('Starting main monitoring loop...'));
const logFrameAnalysis = tap((analysis) => logger.info('Frame analysis:', analysis));
const logMuteAction = tap((action) => logger.info(`${action} TV based on content detection`));
const logFrameError = tap((error) => logger.error('Frame processing failed:', error.message));
const logWaitTime = tap(() => logger.debug(`Waiting ${APP_CONFIG.CAPTURE_INTERVAL_MS}ms before next capture...`));

// Initialize application state
const initializeApp = async () => {
  const initialize = asyncPipe(
    logAppStart,
    validateEnvironment,
    () => userPrompts.selectContentType(),
    initializeState,
    logAppInitialized
  );
  
  const result = await tryCatch(initialize)();
  
  if (!result.success) {
    throw createApplicationError('Failed to initialize application', result.error);
  }
  
  return result.data;
};

// Frame processing pipeline
const processFrame = curry(async (state) => {
  const contentDescription = getContentDescription(state);
  
  const frameProcessor = asyncPipe(
    () => webcamService.captureFrame(),
    (imageBase64) => visionAnalysisService.analyzeVideoContent(imageBase64, contentDescription),
    logFrameAnalysis,
    (analysis) => handleMuteLogic(state, analysis)
  );
  
  const result = await tryCatch(frameProcessor)();
  
  if (!result.success) {
    logFrameError(result.error);
    return state;
  }
  
  return result.data;
});

// Mute logic as pure function
const handleMuteLogic = async (state, analysis) => {
  const currentlyMuted = isMuted(state);
  const shouldMute = analysis.should_mute_tv;
  
  if (!currentlyMuted && shouldMute) {
    await tvRemoteService.toggleMute();
    logMuteAction('Muting');
    return setMuted(true)(state);
  } else if (currentlyMuted && !shouldMute) {
    await tvRemoteService.toggleMute();
    logMuteAction('Unmuting');
    return setMuted(false)(state);
  }
  
  return state;
};

// Main application loop
const runMainLoop = async (initialState) => {
  logLoopStart();
  let currentState = initialState;
  
  while (isRunning(currentState)) {
    currentState = await processFrame(currentState);
    logWaitTime();
    await delay(APP_CONFIG.CAPTURE_INTERVAL_MS)();
  }
  
  return currentState;
};

// Create the main application function
const createApp = () => {
  let appState = createAppState();
  
  const stop = () => {
    logger.info('Stopping application...');
    appState = stopApp(appState);
  };
  
  const start = async () => {
    appState = await initializeApp();
    return await runMainLoop(appState);
  };
  
  return { start, stop };
};

// Main function using functional approach
const main = async () => {
  const app = createApp();
  
  process.on('SIGINT', () => {
    logger.info('Received SIGINT signal, gracefully shutting down...');
    app.stop();
    process.exit(0);
  });
  
  const result = await tryCatch(app.start)();
  
  if (!result.success) {
    logger.error('Application failed:', result.error);
    process.exit(1);
  }
};

main();