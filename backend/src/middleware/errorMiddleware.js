import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    // 1. Log the error to the daily rotating file
    logger.error(err);

    // 2. Send response to client
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        // Show stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};