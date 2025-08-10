import { logger } from '../utils/logger.js'

export const tvRemoteNoopService = {
  toggleMute: async () => {
    logger.info('TV_CONTROL_ENABLED=false: toggleMute skipped (noop)')
  },
  wakeUp: async () => {
    logger.info('TV_CONTROL_ENABLED=false: wakeUp skipped (noop)')
  },
}

