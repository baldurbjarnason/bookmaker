'use strict'

logger = require('winston')

replaceLogger = (newLogger) ->
  logger = newLogger


module.exports = {
  logger: logger
  replaceLogger: replaceLogger
}