'use strict'

glob = require 'glob'
whenjs = require('when')
sequence = require('when/sequence')
nodefn = require("when/node/function")
pglob = nodefn.lift(glob)
_ = require 'underscore'
fs = require 'fs'
ncp = require('ncp').ncp
path = require 'path'
log = require('./logger').logger

# Some way to enable single chapter css and js? Is that even necessary?

class Assets
  constructor: (@root, @assetsPath) ->
  get: (filepath) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    fn = path.resolve(@root, filepath)
    fs.readFile(fn, (err, data) ->
      if err
        log.error err
        deferred.reject
      else
        deferred.resolve(data, filepath))
    return promise
  getStream: (filepath, options) ->
    fs.createReadStream(path.resolve(@root, filepath), options)
  addItemToZip: (item, zip) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    resolver = () ->
      log.info "#{item} written to zip"
      deferred.resolve()
    zip.addFile(@getStream(item), { name: item }, resolver)
    return promise
  addTypeToZip: (type, zip) ->
    tasks = []
    for item in this[type]
      tasks.push(@addItemToZip.bind(this, item, zip))
    sequence tasks
  addToZip: (zip) ->
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      tasks.push(@addTypeToZip.bind(this, type, zip))
    sequence tasks
  copy: (directory) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    deferred.notify "Copying assets"
    ncp(path.resolve(@root, @assetsPath), directory, (err) ->
      if err
        log.error err
        deferred.reject err
      else
        log.info "Assets copied to #{directory}"
        deferred.resolve())
    return promise

  init: () ->
    task = (type) ->
      unless @assetsPath
        @assetsPath = ""
      if @assetsPath is "."
        @assetsPath = ""
      @[type] = glob.sync(@assetsPath + "**/*.#{type}", { cwd: @root })
      if type is 'jpg'
        jpegList = glob.sync(@assetsPath + "**/*.jpeg", { cwd: @root })
        @jpg = @jpg.concat(jpegList)
      return
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      tasks.push(task.bind(this, type))
    sequence(tasks).then(() -> return this)
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
