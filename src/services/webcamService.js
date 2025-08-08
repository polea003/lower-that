import NodeWebcam from 'node-webcam';
import { WEBCAM_CONFIG, APP_CONFIG } from '../config/constants.js';
import { logger } from '../utils/logger.js';

class WebcamError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'WebcamError';
    this.cause = cause;
  }
}

class WebcamService {
  constructor() {
    const options = {
      width: WEBCAM_CONFIG.WIDTH,
      height: WEBCAM_CONFIG.HEIGHT,
      quality: WEBCAM_CONFIG.QUALITY,
      output: WEBCAM_CONFIG.OUTPUT_FORMAT,
      callbackReturn: 'base64'
    };

    this.webcam = NodeWebcam.create(options);
    logger.info('WebcamService initialized with options:', options);
  }

  async captureFrame() {
    logger.debug('Capturing webcam frame...');
    
    return new Promise((resolve, reject) => {
      this.webcam.capture(APP_CONFIG.CAPTURE_FILENAME, (error, base64Data) => {
        if (error) {
          const webcamError = new WebcamError('Failed to capture webcam frame', error);
          logger.error('Webcam capture failed:', error);
          reject(webcamError);
          return;
        }

        logger.debug('Webcam frame captured successfully');
        resolve(base64Data);
      });
    });
  }
}

export const webcamService = new WebcamService();