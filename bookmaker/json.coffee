'use strict'

fs = require('fs')
bookmaker = require './index'
Assets = bookmaker.Assets
Chapter = bookmaker.Chapter
Book = bookmaker.Book
SubOutline = bookmaker.SubOutline
whenjs = require('when')
_ = require 'underscore'
path = require 'path'
sequence = require('when/sequence')
fs = require 'fs'
nodefn = require("when/node/function")
mkdirp = require('mkdirp')
ensuredir = (directory) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  mkdirp(directory, (err) ->
    if err
      deferred.reject(err)
    else
      deferred.resolve())
  return promise


write = (filename, data) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  fs.writeFile(filename, data, (err) ->
    if err
      deferred.reject(err)
    else
      deferred.resolve())
  return promise

extend = (Chapter, Book, Assets) ->
  extendChapter(Chapter)
  extendBook(Book)
  extendAssets(Assets)

filter = (key, value) ->
  if key is ""
    return value
  if key is 'toJSON'
    return ""
  return value

extendChapter = (Chapter) ->
  Chapter.prototype.toHal = () ->
    banned = ['book', 'meta', 'filename','assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this))
    hal = _.omit this, banned
    hal.body = @html
    hal.type = 'html'
    tocpath = path.relative(path.resolve("/", path.dirname(@filename)), "/index.json")
    selfpath = @formatPath('json')
    hal._links = {
      toc: { href: tocpath, name: 'TOC-JSON', type: "application/hal+json" },
      self: { href: selfpath, type: "application/hal+json" }
    }
    if @book.assets?.css and !@book.meta.specifiedCss
      hal._links.stylesheets = for href in @book.assets.css
        { href: href, type: "text/css" }
    else if @css
      hal._links.stylesheets = for href in @css
        { href: href, type: "text/css" }
    if @book.assets?.js and !@book.meta.specifiedJs
      hal._links.javascript = for href in @book.assets.js
        { href: href, type: "application/javascript" }
    else if @js
      hal._links.javascript = for href in @js
        { href: href, type: "application/javascript" }
    selfindex = @book.chapters.indexOf(this)
    if selfindex isnt 0
      hal._links.prev = { href: @book.chapters[selfindex - 1].formatPath('json'), type: "application/hal+json" }
    if selfindex isnt @book.chapters.length - 1
      hal._links.next = { href: @book.chapters[selfindex + 1].formatPath('json'), type: "application/hal+json" }
    if @subChapters
      subChapters = []
      for subChapter in @subChapters.chapters
        subChapters.push(subChapter)
      hal._embedded.chapters = subChapters
    return hal
  Chapter.prototype.toJSON = () ->
    hal = @toHal()
    return JSON.stringify hal, filter, 2
  return Chapter


extendAssets = (Assets) ->
  return Assets
extendBook = (Book) ->
  Book.prototype.toHal = (options) ->
    # banned = ['chapters', '_chapterIndex', '_navPoint', '_globalCounter', 'docIdCount', 'root', 'meta', 'assets', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this))
    hal = {}
    _.extend hal, @meta
    if options?.prefix
      selfpath = options.prefix + 'index.json'
    else
      selfpath = 'index.json'
    unless hal._links
      hal._links = {}
    hal._links.self = { href: selfpath, type: "application/hal+json", hreflang: @meta.lang }
    hal._links.cover = {
      href: @meta.cover
    }
    if @meta.start
      hal._links.start = {
        href: @meta.start.formatPath('json')
        type: "application/hal+json"
      }
    if !options?.embedChapters
      hal._links.chapters = for chapter in @chapters
        { href: chapter.formatPath('json'), type: "application/hal+json", hreflang: @meta.lang  }
    else
      hal._links.chapters = @chapters
    hal._links.images = []
    for image in @assets.png
      hal._links.images.push({ href: image, type: "image/png"  })
    for image in @assets.jpg
      hal._links.images.push({ href: image, type: "image/jpeg"  })
    for image in @assets.gif
      hal._links.images.push({ href: image, type: "image/gif"  })
    for image in @assets.svg
      hal._links.images.push({ href: image, type: "image/svg+xml"  })
    hal._links.stylesheets = for stylesheet in @assets.css
      { href: stylesheet, type: "text/css"  }
    hal._links.javascript = for href in @assets.js
      { href: href, type: "application/javascript" }
    hal.date = @meta.date.isoDate
    hal.cover = null
    hal.start = null
    hal.modified = @meta.modified.isoDate
    return hal
  Book.prototype.toJSON = (options) ->
    hal = @toHal(options)
    return JSON.stringify hal, filter, 2
  Book.prototype.toJsonFiles = (directory, options) ->
    report = (thing) -> console.log(thing)
    sequence(tasks)
    hal = @toHal(options)
    hal.assetsPath = @assets.assetsPath
    json = JSON.stringify hal, filter, 2
    tasks = []
    if directory
      tasks.push ensuredir directory
    else
      directory = directory || process.cwd()
    tasks.push ensuredir directory + 'chapters/'
    tasks.push(@assets.copy(directory + hal.assetsPath))
    for chapter in @chapters
      tasks.push(write(directory + chapter.formatPath('json'), chapter.toJSON(), 'utf8'))
    tasks.push write(directory + 'index.json', json, 'utf8')
    whenjs.all tasks
  return Book


# Don't forget to add
#     hal.assetsPath = @assets.assetsPath
# When you do the toJsonFiles method

module.exports = {
  extend: extend
}