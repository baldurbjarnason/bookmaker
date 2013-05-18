'use strict'

glob = require 'glob'
whenjs = require('when')
nodefn = require("when/node/function")
pglob = nodefn.lift(glob)
_ = require 'underscore'
fs = require 'fs'

# Some way to enable single chapter css and js? Is that even necessary?

class Assets
  constructor: (@root, @assetsPath) ->
  pngPromise: () ->
    pglob(@assetsPath + '**/*.png', { cwd: @root })
  jpgPromise: () ->
    pglob(@assetsPath + '**/*.jpg', { cwd: @root })
  gifPromise: () ->
    pglob(@assetsPath + '**/*.gif', { cwd: @root })
  cssPromise: () ->
    pglob(@assetsPath + '**/*.css', { cwd: @root })
  svgPromise: () ->
    pglob(@assetsPath + '**/*.svg', { cwd: @root })
  jsPromise: () ->
    pglob(@assetsPath + '**/*.js', { cwd: @root })
  ttfPromise: () ->
    pglob(@assetsPath + '**/*.ttf', { cwd: @root })
  otfPromise: () ->
    pglob(@assetsPath + '**/*.otf', { cwd: @root })
  woffPromise: () ->
    pglob(@assetsPath + '**/*.woff', { cwd: @root })
  get: (path) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    fn = @root + path
    fs.readFile(fn, (err, data) ->
      if err
        deferred.reject
      else
        deferred.resolve(data, path))
    return promise

mglob = _.memoize glob.sync

Object.defineProperty Assets.prototype, 'png', {
  get: ->
    mglob(@assetsPath + '**/*.png', { cwd: @root })
  enumerable: true
}



Object.defineProperty Assets.prototype, 'jpg', {
  get: ->
    mglob(@assetsPath + '**/*.jpg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'gif', {
  get: ->
    mglob(@assetsPath + '**/*.gif', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'css', {
  get: ->
    mglob(@assetsPath + '**/*.css', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'svg', {
  get: ->
    mglob(@assetsPath + '**/*.svg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'js', {
  get: ->
    mglob(@assetsPath + '**/*.js', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'ttf', {
  get: ->
    mglob(@assetsPath + '**/*.ttf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'otf', {
  get: ->
    mglob(@assetsPath + '**/*.otf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'woff', {
  get: ->
    mglob(@assetsPath + '**/*.woff', { cwd: @root })
  enumerable: true
}

module.exports = Assets
