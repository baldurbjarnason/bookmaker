'use strict'

glob = require 'glob'
async = require 'async'
fs = require 'fs'
ncp = require('ncp').ncp
path = require 'path'
logger = require('./logger')

types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff', 'm4a', 'm4v', 'mp3']

class Assets
  constructor: (@root, @assetsPath) ->
  get: (filepath, callback) ->
    fn = path.resolve(@root, filepath)
    fs.readFile(fn, callback)
  getStream: (filepath, options) ->
    fs.createReadStream(path.resolve(@root, filepath), options)
  addItemToZip: (item, zip, callback) ->
    resolver = () ->
      logger.log.info "#{item} written to zip"
      callback()
    zip.addFile(@getStream(item), { name: item }, resolver)
  addTypeToZip: (type, zip, callback) ->
    console.log "adding #{type} to zip"
    tasks = []
    for item in this[type]
      tasks.push(@addItemToZip.bind(this, item, zip))
    async.series tasks, callback
  addToZip: (zip, options, callback) ->
    if typeof options is 'function'
      callback = options
    tasks = []
    for type in types
      tasks.push(@addTypeToZip.bind(this, type, zip))
    async.series tasks, callback
  copy: (directory, callback) ->
    source = path.resolve(@root, @assetsPath)
    resolver = (err) ->
      logger.log.info "Assets copied"
      callback(err)
    ncp(source, directory, resolver)

  init: (callback) ->
    task = (type, callback) ->
      unless @assetsPath
        @assetsPath = ""
      if @assetsPath is "."
        @assetsPath = ""
      @[type] = glob.sync(@assetsPath + "**/*.#{type}", { cwd: @root })
      if type is 'jpg'
        jpegList = glob.sync(@assetsPath + "**/*.jpeg", { cwd: @root })
        @jpg = @jpg.concat(jpegList)
      if type is 'm4v'
        m4vList = glob.sync(@assetsPath + "**/*.mp4", { cwd: @root })
        @m4v = @m4v.concat(m4vList)
      callback()
    tasks = []
    for type in types
      tasks.push(task.bind(this, type))
    async.series(tasks, callback)
  initSync: () ->
    newAssetsPath = @assetsPath
    unless newAssetsPath
      newAssetsPath = ""
    if newAssetsPath is '.'
      newAssetsPath = ""
    tasks = []
    for type in types
      @[type] = glob.sync(newAssetsPath + "**/*.#{type}", { cwd: @root })
    jpeg = glob.sync(newAssetsPath + "**/*.jpeg", { cwd: @root })
    @jpg = @jpg.concat(jpeg)
    return

module.exports = Assets
