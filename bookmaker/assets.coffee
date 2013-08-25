'use strict'

glob = require 'glob'
async = require 'async'
_ = require 'underscore'
fs = require 'fs'
ncp = require('ncp').ncp
path = require 'path'
log = require('./logger').logger()

# Some way to enable single chapter css and js? Is that even necessary?

class Assets
  constructor: (@root, @assetsPath) ->
  get: (filepath, callback) ->
    fn = path.resolve(@root, filepath)
    fs.readFile(fn, callback)
  getStream: (filepath, options) ->
    fs.createReadStream(path.resolve(@root, filepath), options)
  addItemToZip: (item, zip, callback) ->
    resolver = () ->
      log.info "#{item} written to zip"
      callback()
    zip.addFile(@getStream(item), { name: item }, resolver)
  addTypeToZip: (type, zip, callback) ->
    tasks = []
    for item in this[type]
      tasks.push(@addItemToZip.bind(this, item, zip))
    async.series tasks, callback
  addToZip: (zip, callback) ->
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      tasks.push(@addTypeToZip.bind(this, type, zip))
    async.series tasks, callback
  copy: (directory, callback) ->
    source = path.resolve(@root, @assetsPath)
    resolver = (err) ->
      log.info "Assets copied"
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
      callback()
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
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
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      @[type] = glob.sync(newAssetsPath + "**/*.#{type}", { cwd: @root })
    jpeg = glob.sync(newAssetsPath + "**/*.jpeg", { cwd: @root })
    @jpg = @jpg.concat(jpeg)
    return

module.exports = Assets
