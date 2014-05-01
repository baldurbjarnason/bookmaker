'use strict'

Assets = require './assets'
Chapter = require './chapter'
path = require 'path'
utilities = require './utilities'
async = require 'async'
$ = require 'jquery'

class Book
  constructor: (meta, @assets) ->
    @chapters = []
    @meta = meta
    @generate = {}
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
      @meta.bookId = 'id' + require('crypto').randomBytes(16).toString('hex')
    if @init
      for fn in @init
        fn(this)
    @docIdCount = 0
  docId: () ->
    @docIdCount++
    return "doc" + @docIdCount
  chapterPrepare: (chapter) ->
    chapter.book = this
    unless chapter.id
      chapter.id = @docId()
    unless chapter.filename
      chapter.filename = 'chapters/' + chapter.id + '.html'
    return chapter
  addChapter: (chapter, options, callback) ->
    @chapterPrepare chapter
    if typeof options is 'function'
      callback = options
    if options?.ignoreLandmarks
      landmarkHrefs = for type in options.ignoreLandmarks
        @findLandmarkHref type
      for chap in @chapters
        index = @chapters.indexOf(chap)
        if landmarkHrefs.indexOf chap.filename is -1
          @chapters.splice(index + 1, 0, chapter)
          @appendOutline chap.filename, chapter
    else
      @chapters.push(chapter)
      if options?.modifyOutline
        @appendOutline @chapters[@chapters.length-1].filename, chapter
    if callback and typeof callback is 'function'
      callback null, this
    else
      return this
  prependChapter: (chapter, options, callback) ->
    @chapterPrepare chapter
    if typeof options is 'function'
      callback = options
    if options?.ignoreLandmarks
      landmarkHrefs = for type in options.ignoreLandmarks
        @findLandmarkHref type
      for index in [@chapters.length..1]
        chap = @chapters[index]
        if landmarkHrefs.indexOf chap.filename is -1
          @chapters.splice(index, 0, chapter)
          @prependOutline chap.filename, chapter
    else
      @chapters.unshift(chapter)
      if options?.modifyOutline
        @prependOutline @chapters[0].filename, chapter
    if callback and typeof callback is 'function'
      callback null, this
    else
      return this
  insertBeforeHref: (href, newChapter) ->
    for chapter in @chapters
      if chapter.filename is href
        index = @chapters.indexOf(chapter)
    unless index is -1
      @chapters.splice(index, 0, newChapter)
  insertAfterHref: (href, newChapter) ->
    for chapter in @chapters
      if chapter.filename is href
        index = @chapters.indexOf(chapter)
    unless index is -1
      @chapters.splice(index+1, 0, newChapter)
  findLandmarkHref: (landmark) ->
    for landmark in @meta.landmarks
      if landmark.type is 'bodymatter'
        landmarkHref = landmark.href
    return landmarkHref
  updateLandmark: (landmarkType, newLandmark, newTitle) ->
    for landmark in @meta.landmarks
      if landmark.type is landmarkType
        landmark.href = newLandmark
        if newTitle
          landmark.title = newTitle
  prependOutline: (href, chapter) ->
    if @outline
      $('body').html(@outline)
      html = "<li id='toc-#{ chapter.id }'><a href='#{ chapter.filename }' rel='chapter'>#{ chapter.title }</a></li>"
      $("a[href='#{href}']").parent().before(html)
      @outline = $('body').html()
  appendOutline: (href, chapter) ->
    if @outline
      $('body').html(@outline)
      html = "<li id='toc-#{ chapter.id }'><a href='#{ chapter.filename }' rel='chapter'>#{ chapter.title }</a></li>"
      $("a[href='#{href}']").parent().after(html)
      @outline = $('body').html()
  relative: utilities.relative
  addChaptersToZip: (zip, template, callback) ->
    tasks = []
    for chapter in @chapters
      context = chapter.context(this)
      tasks.push(context.addToZip.bind(context, zip, template))
    async.series(tasks, callback)

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

module.exports = {
  Book: Book
}