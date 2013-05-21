'use strict'

rs = require('robotskirt')
renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML])
mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES])
$ = require 'jquery'
Assets = require './assets'
_ = require 'underscore'
handlebars = require('handlebars')
whenjs = require('when')
path = require 'path'

class Chapter
  constructor: (doc) ->
    _.extend this, doc
  context: (book) =>
    book = book || @book
    chapter = Object.create this
    chapter.book = book
    chapter.meta = book.meta unless @meta
    chapter.assets = book.assets unless @assets
    chapter.chapters = book.chapters unless @chapters
    if book.meta.specifiedJs and @js
      chapter.scripted = true
    else if book.assets?.js
      chapter.scripted = true
    return chapter
  formatPath: (type) ->
    newpath = path.dirname(@filename) + "/" + path.basename(@filename, path.extname(@filename)) + '.' + type
    return newpath

toHtml = ->
  switch @type
    when 'md'
      processHTML mdparser.render @body
    when 'html'
      processHTML @body
    when 'hbs'
      bodytemplate = handlebars.compile @body
      processHTML bodytemplate(@context())
    when 'xhtml'
      @body

Object.defineProperty Chapter.prototype, 'html', {
  get: toHtml
  enumerable: true
}
processHTML = (html) ->
  $('body').html(html)
  $('p').not('p+p').addClass('noindent')
  _counter = {}
  counter = (elem) ->
    unless _counter[elem]
      _counter[elem] = 0
    _counter[elem] += 1
    return _counter[elem]
  addId = (el, elem) ->
    unless el.id
      el.id = elem + '-' + counter(elem)
  elements = ['p','img','h1','h2','h3','h4','div','blockquote','ul','ol','nav', 'li', 'a']
  for elem in elements
    $(elem).each((index) -> addId(this, elem))
  # Need to properly filter entities here. Or at least look further into the issue.
  nbsp = new RegExp('&nbsp;', 'g')
  return rs.smartypantsHtml $('body').html().replace(nbsp, '&#160;')

Chapter.prototype.htmlPromise = () ->
  deferred = whenjs.defer()
  promise = deferred.promise
  @renderHtml(deferred.resolver)
  return promise

Chapter.prototype.renderHtml = (resolver) ->
  resolver.resolve(@html)


module.exports = Chapter