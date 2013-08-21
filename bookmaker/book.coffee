'use strict'

Assets = require './assets'
Chapter = require './chapter'
path = require 'path'
utilities = require './utilities'
whenjs = require('when')
sequence = require('when/sequence')
$ = require 'jquery'

class Book
  constructor: (meta, @assets, @sharedAssets) ->
    @chapters = []
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
      @meta.bookId = 'id' + require('crypto').randomBytes(16).toString('hex')
    if @init
      for fn in @init
        fn(this)
    @docIdCount = 0
  docId: () ->
    @docIdCount++
    return "doc" + @docIdCount
  chapterPrepare: (chapter, bookoverride) ->
    chapter.book = this or bookoverride
    unless chapter.id
      chapter.id = @docId()
    unless chapter.filename
      chapter.filename = 'chapters/' + chapter.id + '.html'
    return chapter
  addChapter: (chapter, bookoverride) ->
    # chapter.book = this or bookoverride
    # unless chapter.id
    #   chapter.id = @docId()
    # unless chapter.filename
    #   chapter.filename = 'chapters/' + chapter.id + '.html'
    @chapterPrepare chapter, bookoverride
    @chapters.push(chapter)
  prependChapter: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    @chapters.unshift chapter
  insertBeforeHref: (href, newChapter) ->
    for chapter in @chapters
      if chapter.filename is href
        index = @chapters.indexOf(chapter)
    unless index is -1
      @chapters.splice(index, 0, newChapter)
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
  appendMain: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    landmarkHref = @findLandmarkHref 'backmatter'
    if landmarkHref
      @insertBeforeHref landmarkHref, chapters
      @prependOutline landmarkHref, chapter
    else
      @addChapter chapter
  prependMain: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    landmarkHref = @findLandmarkHref 'bodymatter'
    if landmarkHref
      @insertBeforeHref landmarkHref, chapter
      @updateLandmark 'bodymatter', landmarkHref
      @prependOutline landmarkHref, chapter
    else
      @prependChapter chapter
  appendFront: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    landmarkHref = @findLandmarkHref 'bodymatter'
    if landmarkHref
      @insertBeforeHref landmarkHref, chapter
      @prependOutline landmarkHref, chapter
    else
      @prependChapter chapter
  prependFront: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    landmarkHref = @findLandmarkHref 'frontmatter'
    if landmarkHref
      @insertBeforeHref landmarkHref, chapter
      @updateLandmark 'frontmatter', landmarkHref
      @prependOutline landmarkHref, chapter
    else
      @prependChapter chapter
  appendBack: @addChapter
  prependBack: (chapter, bookoverride) ->
    @chapterPrepare chapter, bookoverride
    landmarkHref = @findLandmarkHref 'backmatter'
    if landmarkHref
      @insertBeforeHref landmarkHref, chapter
      @updateLandmark 'backmatter', landmarkHref
      @prependOutline landmarkHref, chapter
    else
      @addChapter chapter
  prependOutline: (href, chapter) ->
    if @outline
      $('body').html(@outline)
      html = "<li id='toc-#{ chapter.id }'><a href='#{ chapter.filename }' rel='chapter'>#{ chapter.title }</a></li>"
      $("a[href='#{href}']").parent().before(html)
      @outline = $('body').html()
  relative: utilities.relative
  addChaptersToZip: (zip, template) ->
    tasks = []
    for chapter in @chapters
      context = chapter.context(this)
      tasks.push(context.addToZip.bind(context, zip, template))
    sequence(tasks)

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