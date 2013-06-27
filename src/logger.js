'use strict';
var logger, replaceLogger;

logger = require('winston');

replaceLogger = function(newLogger) {
  return logger = newLogger;
};

module.exports = {
  logger: logger,
  replaceLogger: replaceLogger
};
