const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',  // Levels: error, warn, info, verbose, debug, silly
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new transports.Console(),                // Logs to console
    new transports.File({ filename: 'app.log' }) // Logs to file
  ]
});

module.exports = logger;
