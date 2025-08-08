import NodeWebcam from 'node-webcam';
import { WEBCAM_CONFIG, APP_CONFIG } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import { tryCatch, tap } from '../utils/functional.js';

const createWebcamError = (message, cause) => {
  const error = new Error(message);
  error.name = 'WebcamError';
  error.cause = cause;
  return error;
};

const createWebcamOptions = () => ({
  width: WEBCAM_CONFIG.WIDTH,
  height: WEBCAM_CONFIG.HEIGHT,
  quality: WEBCAM_CONFIG.QUALITY,
  output: WEBCAM_CONFIG.OUTPUT_FORMAT,
  callbackReturn: 'base64'
});

const createWebcam = (options) => {
  logger.info('Creating webcam with options:', options);
  return NodeWebcam.create(options);
};

const promisifyCapture = (webcam) => (filename) => 
  new Promise((resolve, reject) => {
    webcam.capture(filename, (error, base64Data) => {
      if (error) {
        const webcamError = createWebcamError('Failed to capture webcam frame', error);
        logger.error('Webcam capture failed:', error);
        reject(webcamError);
        return;
      }
      resolve(base64Data);
    });
  });

const logCapture = tap(() => logger.debug('Capturing webcam frame...'));
const logSuccess = tap(() => logger.debug('Webcam frame captured successfully'));

const createWebcamService = () => {
  const options = createWebcamOptions();
  const webcam = createWebcam(options);
  const capture = promisifyCapture(webcam);
  
  return {
    captureFrame: async () => {
      logCapture();
      const result = await tryCatch(() => capture(APP_CONFIG.CAPTURE_FILENAME))();
      return result.success ? logSuccess(result.data) : Promise.reject(result.error);
    }
  };
};

export const webcamService = createWebcamService();