import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors } = winston.format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${stack ? `\nStack: ${stack}` : ''}\n-----------------------------------`;
});

// Configure rotation for errors
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/errors-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

const transportsList = [fileRotateTransport];
if (process.env.NODE_ENV !== 'test') {
  transportsList.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: transportsList
});

export default logger;