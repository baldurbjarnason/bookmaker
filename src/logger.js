'use strict';
var logger, loggers, replaceLogger, winston;

winston = require('winston');

loggers = {};

loggers.defaultLogger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      colorize: 'true'
    })
  ]
});

replaceLogger = function(newLogger) {
  return loggers.newLogger = newLogger;
};

logger = function() {
  if (loggers.newLogger) {
    return loggers.newLogger;
  } else {
    return loggers.defaultLogger;
  }
};

module.exports = {
  logger: logger,
  replaceLogger: replaceLogger
};
