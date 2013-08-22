'use strict'

loggers = { defaultLogger: require('winston') }


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