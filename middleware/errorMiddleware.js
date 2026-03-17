/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${err.message}`);
    if (err.stack) {
        console.error(`\x1b[90m${err.stack}\x1b[0m`);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
