'use strict'

glob = require 'glob'
whenjs = require('when')
sequence = require('when/sequence')
nodefn = require("when/node/function")
pglob = nodefn.lift(glob)
_ = require 'underscore'
fs = require 'fs'
ncp = require('ncp').ncp

# Some way to enable single chapter css and js? Is that even necessary?

class Assets
  constructor: (@root, @assetsPath) ->
  get: (filepath) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    fn = @root + filepath
    fs.readFile(fn, (err, data) ->
      if err
        deferred.reject
      else
        deferred.resolve(data, filepath))
    return promise
  getStream: (filepath, options) ->
    fs.createReadStream(@root + filepath, options)
  addItemToZip: (item, zip) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    deferred.notify "Writing #{item} to zip"
    zip.addFile(@getStream(item), { name: item }, deferred.resolve)
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
    ncp(@root + @assetsPath, directory, (err) ->
      if err
        deferred.reject err
      else
        deferred.resolve())
    return promise

  init: () ->
    task = (type) ->
      unless @assetsPath
        @assetsPath = ""
      @[type] = glob.sync(@assetsPath + "**/*.#{type}", { cwd: @root })
      return
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      tasks.push(task.bind(this, type))
    sequence(tasks).then(() -> return this)

module.exports = Assets
