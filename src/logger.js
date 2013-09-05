'use strict';
var winston;

winston = require('winston');

module.exports = {
  log: new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        colorize: 'true'
      })
    ]
  }),
  replaceLogger: function(newLogger) {
    return this.log = newLogger;
  }
};
