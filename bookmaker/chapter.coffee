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
  context: () =>
    @meta = @book.meta unless @meta
    @assets = @book.assets unless @assets
    @chapters = @book.chapters unless @chapters
    return this
  formatPath: (type) ->
    newpath = path.dirname(@filename) + "/" + path.basename(@filename, path.extname(@filename)) + '.' + type
    return newpath
  toHal: () ->
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
    if @book.assets?.css
      hal._links.stylesheets = for href in @book.assets.css
        { href: href }
    if @js
      hal._links.stylesheets = for href in @js
        { href: href }
    selfindex = @book.chapters.indexOf(this)
    if selfindex isnt 0
      hal._links.prev = { href: @books.chapters[selfindex - 1].formatPath() }
    if selfindex isnt @book.chapters.length - 1
      hal._links.next = { href: @books.chapters[selfindex + 1].formatPath() }
    return hal
  toJSON: () ->
    json = @toHal()
    filter = (key, value) ->
      if key is ""
        return value
      if key is 'subChapters'
        subChapters = []
        for subChapter in subChapters.chapters
          subChapters.push(subChapter)
        return subChapters
      if key is 'date'
        return date.date.toString()
      if key is 'toJSON'
        return ""
      return value
    stringified = JSON.stringify json, filter, 2
    return stringified

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