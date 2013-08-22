'use strict';
var logger, loggers, replaceLogger;

loggers = {
  defaultLogger: require('winston')
};

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
