import { environment } from './config/environment.js';
import { APP_CONFIG } from './config/constants.js';
import { logger } from './utils/logger.js';
import { userPrompts } from './ui/userPrompts.js';
import { webcamService } from './services/webcamService.js';
import { visionAnalysisService } from './services/visionAnalysisService.js';
import { tvRemoteService } from './services/tvRemoteService.js';

class ApplicationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ApplicationError';
    this.cause = cause;
  }
}

class LowerThatApp {
  constructor() {
    this.isMuted = false;
    this.contentDescription = null;
    this.isRunning = false;
  }

  async initialize() {
    try {
      logger.info('Starting Lower That application...');
      
      environment.validate();
      
      this.contentDescription = await userPrompts.selectContentType();
      logger.info('Application initialized successfully');
      
    } catch (error) {
      throw new ApplicationError('Failed to initialize application', error);
    }
  }

  async processFrame() {
    try {
      const imageBase64 = await webcamService.captureFrame();
      const analysis = await visionAnalysisService.analyzeVideoContent(
        imageBase64, 
        this.contentDescription
      );

      logger.info('Frame analysis:', analysis);

      await this._handleMuteLogic(analysis.should_mute_tv);
      
    } catch (error) {
      logger.error('Frame processing failed:', error.message);
    }
  }

  async _handleMuteLogic(shouldMute) {
    if (!this.isMuted && shouldMute) {
      logger.info('Muting TV - unwanted content detected');
      await tvRemoteService.toggleMute();
      this.isMuted = true;
    } else if (this.isMuted && !shouldMute) {
      logger.info('Unmuting TV - preferred content detected');
      await tvRemoteService.toggleMute();
      this.isMuted = false;
    }
  }

  async start() {
    await this.initialize();
    
    this.isRunning = true;
    logger.info('Starting main monitoring loop...');
    
    while (this.isRunning) {
      await this.processFrame();
      
      logger.debug(`Waiting ${APP_CONFIG.CAPTURE_INTERVAL_MS}ms before next capture...`);
      await this._sleep(APP_CONFIG.CAPTURE_INTERVAL_MS);
    }
  }

  stop() {
    logger.info('Stopping application...');
    this.isRunning = false;
  }

  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const app = new LowerThatApp();
  
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
}

main();