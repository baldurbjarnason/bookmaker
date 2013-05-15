'use strict'

handlebars = require('handlebars')
helpers = require('./hbs.js')
Assets = require './assets.coffee'
Chapter = require './chapter.coffee'


class Book
  constructor: (meta, @assets, @sharedAssets) ->
    helpers.register(handlebars)
    @chapters = []
    @root = meta.bookFolder || process.cwd()
    @meta = meta
    unless @assets
      @assetsFolder = @meta.assetsFolder || 'assets/'
      @assets = new Assets(@root, @assetsFolder)
    if @meta.sharedAssetsFolder and !(@sharedAssets?)
      @sharedAssets = new Assets(@meta.sharedAssetsRoot, @meta.sharedAssetsFolder)
    @docIdCount = 0
  docID: () ->
    docIdCount++
    return "doc" + docIdCount
  addChapter: (chapter) ->
    chapter.book = this
    chapter.id = @docId() unless chapter.id
    chapter.filename = 'chapters/doc' + chapter.id + '.html' unless chapter.filename
    if chapter.subChapters
      chapter.subChapters = new SubOutline(chapter.subChapters, this)
    @chapters.push(chapter)
  everyChapter: (callback) ->
    for chapter in @chapters
      callback(chapter)
      if chapter.subChapters
        chapter.subChapters.everyChapter(callback)
  context = () ->
    context = {
      meta: @meta,
      assets: @assets,
      outline: @chapters
    }
    return context


class SubOutline extends Book
  constructor: (sub, @book) ->
    @chapters = []
    for entry in sub
      if typeof entry is 'string'
        @loadFile(entry)
      else
        chapter = new Chapter(entry)
        chapter.book = @book
        if entry.subChapters
          chapter.subChapters = new SubOutline(entry.subChapters, this)
        @addChapter(chapter)
    docID: ->
      @book.docID()

require('./epub.coffee').extend(Chapter, Book, Assets)
require('./loaders.coffee').extend(Book)

module.exports = {
  Book: Book
  SubOutline: SubOutline
}