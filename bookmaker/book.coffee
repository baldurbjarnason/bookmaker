'use strict'

handlebars = require('handlebars')
Assets = require './assets'
Chapter = require './chapter'


class Book
  constructor: (meta, @assets, @sharedAssets) ->
    @chapters = []
    @root = meta.bookFolder || process.cwd()
    @meta = meta
    @_chapterIndex = 1
    @_navPoint = 1
    unless @assets
      @assetsFolder = @meta.assetsFolder || 'assets/'
      @assets = new Assets(@root, @assetsFolder)
    if @meta.sharedAssetsFolder and !(@sharedAssets?)
      @sharedAssets = new Assets(@meta.sharedAssetsRoot, @meta.sharedAssetsFolder)
    @docIdCount = 0
  docId: () ->
    @docIdCount++
    return "doc" + @docIdCount
  addChapter: (chapter, bookoverride) ->
    chapter.book = this or bookoverride
    unless chapter.id
      chapter.id = @docId()
    unless chapter.filename
      chapter.filename = 'chapters/' + chapter.id + '.html'
    if chapter.subChapters
      chapter.subChapters = new SubOutline(chapter.subChapters, this)
    @chapters.push(chapter)
  context: () ->
    context = {
      meta: @meta,
      assets: @assets,
      chapters: @chapters
    }
    return context


  # everyChapter: (callback) ->
  #   for chapter in @chapters
  #     callback(chapter)
  #     if chapter.subChapters
  #       chapter.subChapters.everyChapter(callback)

class SubOutline extends Book
  constructor: (sub, @book) ->
    @chapters = []
    for entry in sub
      chapter = new Chapter(entry)
      if entry.subChapters
        chapter.subChapters = new SubOutline(entry.subChapters, @book)
      @addChapter(chapter, @book)
    docId: ->
      id = @book.docId()
      return id

module.exports = {
  Book: Book
  SubOutline: SubOutline
}