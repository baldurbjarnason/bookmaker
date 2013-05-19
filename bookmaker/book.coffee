'use strict'

handlebars = require('handlebars')
Assets = require './assets'
Chapter = require './chapter'
path = require 'path'

class Book
  constructor: (meta, @assets, @sharedAssets) ->
    @chapters = []
    @root = meta.root || process.cwd()
    @meta = meta
    @meta.date =
      if meta.date
        dateProcess(meta.date)
      else
        dateProcess()
    @meta.modified =
      if meta.modified
        dateProcess(meta.modified)
      else
        dateProcess()
    @meta.copyrightYear = meta.copyrightYear || meta.date.dateYear
    @meta.version = meta.version || "0.1"
    @meta.lang = meta.lang || 'en'
    unless meta.bookId
      @meta.bookId = require('crypto').randomBytes(16).toString('hex')
    @_chapterIndex = 0
    @_navPoint = 0
    @_globalCounter = 0
    if @init
      for fn in @init
        fn(this)
    # unless @assets
    #   @assetsPath = @meta.assetsPath || 'assets/'
    #   @assets = new Assets(@root, @assetsPath)
    # if @meta.sharedAssetsPath and !(@sharedAssets?)
    #   @sharedAssets = new Assets(@meta.sharedAssetsRoot, @meta.sharedAssetsPath)
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
  # context: () ->
  #   context = {
  #     meta: @meta,
  #     assets: @assets,
  #     chapters: @chapters
  #   }
  #   return context


  # everyChapter: (callback) ->
  #   for chapter in @chapters
  #     callback(chapter)
  #     if chapter.subChapters
  #       chapter.subChapters.everyChapter(callback)

dateProcess = (date) ->
  pad = (n) ->
    if n < 10
      padded = '0' + n
    else
      padded = n
    return padded
  _meta = {}
  if date?
    _date = new Date(date)
  else
    _date = new Date()
  _meta.date = _date
  _meta.dateYear = _date.getUTCFullYear()
  _meta.dateDay = pad _date.getUTCDate()
  _meta.dateMonth = pad _date.getUTCMonth() + 1
  _meta.dateHours = pad _date.getUTCHours()
  _meta.dateMinutes = pad _date.getUTCMinutes()
  _meta.dateSeconds = pad _date.getUTCSeconds()
  _meta.isoDate = "#{_meta.dateYear}-#{_meta.dateMonth}-#{_meta.dateDay}T#{_meta.dateHours}:#{_meta.dateMinutes}:#{_meta.dateSeconds}Z"
  return _meta

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