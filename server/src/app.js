import { environment } from './config/environment.js';
import { APP_CONFIG } from './config/constants.js';
import { logger } from './utils/logger.js';
import { userPrompts } from './ui/userPrompts.js';
import { webcamService } from './services/webcamService.js';
import { visionAnalysisService } from './services/visionAnalysisService.js';
import { tvRemoteService } from './services/tvRemoteService.js';
import { sleep } from './utils/functional.js';
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

// Helpers
const validateEnvironment = () => {
  logger.info('Validating environment...');
  environment.validate();
};

// Initialize application state
const initializeApp = async () => {
  try {
    logger.info('Starting Lower That application...');
    validateEnvironment();
    const choice = await userPrompts.selectContentType();
    const state = initializeState(choice);
    logger.info('Application initialized successfully');
    return state;
  } catch (error) {
    throw createApplicationError('Failed to initialize application', error);
  }
};

// Frame processing pipeline
const processFrame = async (state) => {
  const contentDescription = getContentDescription(state);
  try {
    const imageBase64 = await webcamService.captureFrame();
    const analysis = await visionAnalysisService.analyzeVideoContent(
      imageBase64,
      contentDescription
    );
    logger.info('Frame analysis:', analysis);
    const nextState = await handleMuteLogic(state, analysis);
    return nextState;
  } catch (error) {
    logger.error('Frame processing failed:', error.message || error);
    return state;
  }
};

// Mute logic as pure function
const handleMuteLogic = async (state, analysis) => {
  const currentlyMuted = isMuted(state);
  const shouldMute = analysis.should_mute_tv;
  
  if (!currentlyMuted && shouldMute) {
    await tvRemoteService.toggleMute();
    logger.info('Muting TV based on content detection');
    return setMuted(state, true);
  } else if (currentlyMuted && !shouldMute) {
    await tvRemoteService.toggleMute();
    logger.info('Unmuting TV based on content detection');
    return setMuted(state, false);
  }
  
  return state;
};

// Main application loop
const runMainLoop = async (initialState) => {
  logger.info('Starting main monitoring loop...');
  let currentState = initialState;
  
  while (isRunning(currentState)) {
    currentState = await processFrame(currentState);
    logger.debug(`Waiting ${APP_CONFIG.CAPTURE_INTERVAL_MS}ms before next capture...`);
    await sleep(APP_CONFIG.CAPTURE_INTERVAL_MS);
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

  try {
    await app.start();
  } catch (error) {
    logger.error('Application failed:', error);
    process.exit(1);
  }
};

main();
