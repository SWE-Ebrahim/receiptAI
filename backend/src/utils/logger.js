/**
 * Logger Utility
 * 
 * Provides consistent logging across the application
 * Automatically disables sensitive logs in production
 * 
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('User logged in');
 *   logger.error('Database connection failed', error);
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Info logs - shown in development only
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Error logs - always shown (critical for debugging)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Debug logs - development only, verbose output
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

module.exports = logger;
