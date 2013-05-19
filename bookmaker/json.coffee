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
    banned = ['book', 'meta', 'assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this))
    hal = _.omit this, banned
    hal.body = @html
    hal.type = 'html'
    tocpath = path.relative(path.resolve("/", path.dirname(@filename)), "/index.json")
    selfpath = @formatPath('json')
    hal._links = {
      toc: { href: tocpath, name: 'JSON'},
      self: { href: selfpath, }
    }
    if @book.assets?.css and !@book.meta.specifiedCss
      hal._links.stylesheets = for href in @book.assets.css
        { href: href }
    else if @css
      hal._links.javascript = for href in @js
        { href: href }
    if @book.assets?.js and !@book.meta.specifiedJs
      hal._links.stylesheets = for href in @book.assets.css
        { href: href }
    else if @js
      hal._links.stylesheets = for href in @js
        { href: href }
    selfindex = @book.chapters.indexOf(this)
    if selfindex isnt 0
      hal._links.prev = { href: @book.chapters[selfindex - 1].formatPath() }
    if selfindex isnt @book.chapters.length - 1
      hal._links.next = { href: @book.chapters[selfindex + 1].formatPath() }
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
    selfpath = 'index.json'
    hal._links = {
      self: { href: selfpath, }
    }
    hal._links.cover = {
      href: @meta.cover
    }
    hal._links.start = {
      href: @meta.start.formatPath('json')
    }
    if !options?.embedChapters
      hal._links.chapters = for chapter in @chapters
        { href: chapter.formatPath('json') }
    else
      hal._links.chapters = @chapters
    hal._links.images = @assets.png.concat(@assets.jpg, @assets.gif, @assets.svg)
    hal._links.stylesheets = @assets.css
    hal._links.javascript = @assets.js
    hal.date = @meta.date.date.toString()
    hal.cover = null
    hal.start = @meta.start.formatPath('json')
    hal.modified = @meta.modified.date.toString()
    return hal
  Book.prototype.toJSON = (options) ->
    hal = @toHal(options)
    return JSON.stringify hal, filter, 2
  return Book


# Don't forget to add
#     hal.assetsPath = @assets.assetsPath
# When you do the toJsonFiles method

module.exports = {
  extend: extend
}