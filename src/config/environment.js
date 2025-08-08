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

function validateEnvironment() {
  try {
    validateRequiredEnvVar('OPENAI_API_KEY');
    validateRequiredEnvVar('SAMSUNG_TV_IP_ADDRESS');
    validateRequiredEnvVar('SAMSUNG_TV_MAC_ADDRESS');
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
  validate: validateEnvironment
};