// Simple logger without external dependencies
// Falls back to console if winston is not installed

let winstonLogger: any = null;

try {
  const winston = require('winston');
  const DailyRotateFile = require('winston-daily-rotate-file');
  const path = require('path');

  const { combine, timestamp, printf, colorize, json } = winston.format;

  const consoleFormat = printf(({ level, message, timestamp, ...metadata }: any) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  });

  const logsDir = path.join(process.cwd(), 'logs');

  winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'sentience' },
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          consoleFormat
        ),
      }),
    ],
  });
} catch {
  // winston not installed, use console fallback
  console.log('[Logger] Winston not installed, using console fallback');
}

// Console fallback logger
const consoleLogger = {
  info: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.LOG_LEVEL === 'debug') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] DEBUG: ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
};

// Use winston if available, otherwise console
const activeLogger = winstonLogger || consoleLogger;

export const log = {
  info: (message: string, meta?: Record<string, any>) => activeLogger.info(message, meta),
  warn: (message: string, meta?: Record<string, any>) => activeLogger.warn(message, meta),
  error: (message: string, meta?: Record<string, any>) => activeLogger.error(message, meta),
  debug: (message: string, meta?: Record<string, any>) => activeLogger.debug(message, meta),
};

export const logger = activeLogger;
