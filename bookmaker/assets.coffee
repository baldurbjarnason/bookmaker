'use strict'

glob = require 'glob'
whenjs = require('when')
nodefn = require("when/node/function")
pglob = nodefn.lift(glob)

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

Object.defineProperty Assets.prototype, 'png', {
  get: ->
    glob.sync(@assetFolder + '**/*.png', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'jpg', {
  get: ->
    glob.sync(@assetFolder + '**/*.jpg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'gif', {
  get: ->
    glob.sync(@assetFolder + '**/*.gif', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'css', {
  get: ->
    glob.sync(@assetFolder + '**/*.css', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'svg', {
  get: ->
    glob.sync(@assetFolder + '**/*.svg', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'js', {
  get: ->
    glob.sync(@assetFolder + '**/*.js', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'ttf', {
  get: ->
    glob.sync(@assetFolder + '**/*.ttf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'otf', {
  get: ->
    glob.sync(@assetFolder + '**/*.otf', { cwd: @root })
  enumerable: true
}

Object.defineProperty Assets.prototype, 'woff', {
  get: ->
    glob.sync(@assetFolder + '**/*.woff', { cwd: @root })
  enumerable: true
}

module.exports = Assets
