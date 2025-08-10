import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

class EnvironmentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function validateRequiredEnvVar(varName) {
  const value = process.env[varName];
  if (!value) {
    throw new EnvironmentError(`Required environment variable ${varName} is not set`);
  }
  return value;
}

const toBoolean = (value, defaultValue = true) => {
  if (value == null) return defaultValue;
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
};

function validateEnvironment() {
  try {
    validateRequiredEnvVar('OPENAI_API_KEY');
    const tvEnabled = toBoolean(process.env.TV_CONTROL_ENABLED, true);
    if (tvEnabled) {
      validateRequiredEnvVar('SAMSUNG_TV_IP_ADDRESS');
      validateRequiredEnvVar('SAMSUNG_TV_MAC_ADDRESS');
    }
    logger.info('Environment variables validated successfully');
  } catch (error) {
    logger.error('Environment validation failed:', error.message);
    throw error;
  }
}

export const environment = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  samsung: {
    ipAddress: process.env.SAMSUNG_TV_IP_ADDRESS,
    macAddress: process.env.SAMSUNG_TV_MAC_ADDRESS
  },
  tvControlEnabled: toBoolean(process.env.TV_CONTROL_ENABLED, true),
  validate: validateEnvironment
};
