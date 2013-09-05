'use strict'

rs = require('robotskirt')
renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML])
mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES])
$ = require 'jquery'
Assets = require './assets'
handlebars = require('handlebars')
path = require 'path'
utilities = require './utilities'
addToZip = utilities.addToZip
typogr = require 'typogr'
nunjucks = require 'nunjucks'
env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), { autoescape: false })
marked = require 'marked'
hljs = require 'highlight.js'
marked.setOptions {
  highlight: (code, lang) ->
    return hljs.highlightAuto(lang, code).value
  langPrefix: ''
}


class Chapter
  constructor: (doc) ->
    for key in Object.keys doc
      this[key] = doc[key]
  context: (book, options) =>
    book = book || @book
    chapter = Object.create this
    chapter.book = book
    chapter.meta = book.meta unless @meta
    chapter.assets = book.assets unless @assets
    chapter.chapters = book.chapters unless @chapters
    chapter.relative = utilities.relative
    chapter.links = utilities.pageLinks chapter, @book
    unless options?.noJs
      if book.meta.specifiedJs and @js
        chapter.scripted = true
      else if book.assets?.js
        chapter.scripted = true
    return chapter
  formatPath: (type) ->
    newpath = path.dirname(@filename) + "/" + path.basename(@filename, path.extname(@filename)) + '.' + type
    return newpath
  addToZip: (zip, template, callback) ->
    unless template
      template = env.getTemplate('chapter.xhtml')
    if !@assets
      context = @context()
    else
      context = this
    addToZip(zip, @filename, template.render.bind(template, context), callback)

toHtml = Chapter.prototype.toHtml = ->
  switch @type
    when 'md'
      @processHTML typogr.typogrify marked @body
    when 'html'
      @processHTML typogr.typogrify @body
    when 'hbs'
      bodytemplate = handlebars.compile @body
      @processHTML typogr.typogrify bodytemplate(@context())
    when 'xhtml'
      @body

Object.defineProperty Chapter.prototype, 'html', {
  get: toHtml
  enumerable: true
}
Chapter.prototype.processHTML = (html) ->
  $('body').html(html)
  $('p').not('p+p').addClass('noindent')
  $('img').addClass('bookmaker-respect')
  _counter = {}
  counter = (elem) ->
    unless _counter[elem]
      _counter[elem] = 0
    _counter[elem] += 1
    return _counter[elem]
  addId = (el, elem) ->
    unless el.id
      el.id = elem + '-' + counter(elem)
  elements = ['p','img','h1','h2','h3','h4','div','blockquote','ul','ol','nav', 'li', 'a', 'figure', 'figcaption']
  for elem in elements
    $(elem).each((index) -> addId(this, elem))
  # Need to properly filter entities here. Or at least look further into the issue.
  nbsp = new RegExp('&nbsp;', 'g')
  return $('body').html().replace(nbsp, '&#160;')

Chapter.prototype.renderHtml = (resolver) ->
  resolver.resolve(@html)


module.exports = Chapter