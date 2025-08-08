import { SamsungTvRemote, Keys } from 'samsung-tv-remote';
import { environment } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class TvRemoteError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TvRemoteError';
    this.cause = cause;
  }
}

class TvRemoteService {
  constructor() {
    this.remote = new SamsungTvRemote({
      ip: environment.samsung.ipAddress,
      mac: environment.samsung.macAddress
    });
    
    logger.info('TvRemoteService initialized for Samsung TV:', {
      ip: environment.samsung.ipAddress,
      mac: environment.samsung.macAddress
    });
  }

  async toggleMute() {
    logger.debug('Toggling TV mute state...');
    
    try {
      await this.remote.sendKey(Keys.KEY_MUTE);
      logger.info('TV mute toggled successfully');
    } catch (error) {
      const remoteError = new TvRemoteError('Failed to toggle TV mute', error);
      logger.error('TV remote operation failed:', error);
      throw remoteError;
    }
  }

  async wakeUp() {
    logger.debug('Waking up TV...');
    
    try {
      await this.remote.wakeTV();
      logger.info('TV wake up signal sent');
    } catch (error) {
      const remoteError = new TvRemoteError('Failed to wake up TV', error);
      logger.error('TV wake up failed:', error);
      throw remoteError;
    }
  }
}

export const tvRemoteService = new TvRemoteService();