import { SamsungTvRemote, Keys } from 'samsung-tv-remote';
import { environment } from '../config/environment.js';
import { logger } from '../utils/logger.js';
import { tryCatch, tap } from '../utils/functional.js';

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
  return key;
};

const wakeTV = (remote) => async () => {
  await remote.wakeTV();
  return 'wake';
};

const logMuteToggle = tap(() => logger.debug('Toggling TV mute state...'));
const logMuteSuccess = tap(() => logger.info('TV mute toggled successfully'));
const logWakeStart = tap(() => logger.debug('Waking up TV...'));
const logWakeSuccess = tap(() => logger.info('TV wake up signal sent'));

const createTvRemoteService = () => {
  const config = createRemoteConfig();
  const remote = createRemote(config);
  const sendKeyToRemote = sendKey(remote);
  const wakeRemote = wakeTV(remote);
  
  return {
    toggleMute: async () => {
      logMuteToggle();
      const result = await tryCatch(() => sendKeyToRemote(Keys.KEY_MUTE))();
      
      if (!result.success) {
        const remoteError = createTvRemoteError('Failed to toggle TV mute', result.error);
        logger.error('TV remote operation failed:', result.error);
        throw remoteError;
      }
      
      return logMuteSuccess(result.data);
    },
    
    wakeUp: async () => {
      logWakeStart();
      const result = await tryCatch(wakeRemote)();
      
      if (!result.success) {
        const remoteError = createTvRemoteError('Failed to wake up TV', result.error);
        logger.error('TV wake up failed:', result.error);
        throw remoteError;
      }
      
      return logWakeSuccess(result.data);
    }
  };
};

export const tvRemoteService = createTvRemoteService();