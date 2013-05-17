'use strict'

glob = require 'glob'
whenjs = require('when')
nodefn = require("when/node/function")
pglob = nodefn.lift(glob)
_ = require 'underscore'
fs = require 'fs'

# Some way to enable single chapter css and js? Is that even necessary?

class Assets
  constructor: (@root, @assetFolder) ->
  pngPromise: () ->
    pglob(@assetFolder + '**/*.png', { cwd: @root })
  jpgPromise: () ->
    pglob(@assetFolder + '**/*.jpg', { cwd: @root })
  gifPromise: () ->
    pglob(@assetFolder + '**/*.gif', { cwd: @root })
  cssPromise: () ->
    pglob(@assetFolder + '**/*.css', { cwd: @root })
  svgPromise: () ->
    pglob(@assetFolder + '**/*.svg', { cwd: @root })
  jsPromise: () ->
    pglob(@assetFolder + '**/*.js', { cwd: @root })
  ttfPromise: () ->
    pglob(@assetFolder + '**/*.ttf', { cwd: @root })
  otfPromise: () ->
    pglob(@assetFolder + '**/*.otf', { cwd: @root })
  woffPromise: () ->
    pglob(@assetFolder + '**/*.woff', { cwd: @root })
  get: (path) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    fn = @root + path
    process.nextTick(() ->
      fs.readFile(fn, (err, data) ->
        if err
          deferred.reject
        else
          deferred.resolve(data)))
    return promise

mglob = _.memoize glob.sync

Object.defineProperty Assets.prototype, 'png', {
  get: ->
    mglob(@assetFolder + '**/*.png', { cwd: @root })
  enumerable: true
}



Object.defineProperty Assets.prototype, 'jpg', {
  get: ->
    mglob(@assetFolder + '**/*.jpg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'gif', {
  get: ->
    mglob(@assetFolder + '**/*.gif', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'css', {
  get: ->
    mglob(@assetFolder + '**/*.css', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'svg', {
  get: ->
    mglob(@assetFolder + '**/*.svg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'js', {
  get: ->
    mglob(@assetFolder + '**/*.js', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'ttf', {
  get: ->
    mglob(@assetFolder + '**/*.ttf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'otf', {
  get: ->
    mglob(@assetFolder + '**/*.otf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'woff', {
  get: ->
    mglob(@assetFolder + '**/*.woff', { cwd: @root })
  enumerable: true
}

module.exports = Assets
