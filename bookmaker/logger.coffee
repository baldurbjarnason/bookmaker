'use strict'

winston = require 'winston'

loggers = {}

loggers.defaultLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'info', colorize: 'true' }),
  ]
})


replaceLogger = (newLogger) ->
  loggers.newLogger = newLogger

logger = () ->
  if loggers.newLogger
    return loggers.newLogger
  else
    return loggers.defaultLogger


module.exports = {
  logger: logger
  replaceLogger: replaceLogger
}