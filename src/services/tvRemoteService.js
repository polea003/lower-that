import { SamsungTvRemote, Keys } from 'samsung-tv-remote';
import { environment } from '../config/environment.js';
import { logger } from '../utils/logger.js';

const createTvRemoteError = (message, cause) => {
  const error = new Error(message);
  error.name = 'TvRemoteError';
  error.cause = cause;
  return error;
};

const createRemoteConfig = () => ({
  ip: environment.samsung.ipAddress,
  mac: environment.samsung.macAddress
});

const createRemote = (config) => {
  logger.info('Creating Samsung TV remote with config:', config);
  return new SamsungTvRemote(config);
};

const sendKey = (remote) => async (key) => {
  await remote.sendKey(key);
};

const wakeTV = (remote) => async () => {
  await remote.wakeTV();
};

const createTvRemoteService = () => {
  const config = createRemoteConfig();
  const remote = createRemote(config);
  const sendKeyToRemote = sendKey(remote);
  const wakeRemote = wakeTV(remote);
  
  return {
    toggleMute: async () => {
      try {
        logger.debug('Toggling TV mute state...');
        await sendKeyToRemote(Keys.KEY_MUTE);
        logger.info('TV mute toggled successfully');
      } catch (error) {
        const remoteError = createTvRemoteError('Failed to toggle TV mute', error);
        logger.error('TV remote operation failed:', error);
        throw remoteError;
      }
    },

    wakeUp: async () => {
      try {
        logger.debug('Waking up TV...');
        await wakeRemote();
        logger.info('TV wake up signal sent');
      } catch (error) {
        const remoteError = createTvRemoteError('Failed to wake up TV', error);
        logger.error('TV wake up failed:', error);
        throw remoteError;
      }
    }
  };
};

export const tvRemoteService = createTvRemoteService();
