'use strict'

winston = require 'winston'
module.exports = {
  log: new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'info', colorize: 'true' }),
    ]
  })
  replaceLogger: (newLogger) ->
    @log = newLogger
}