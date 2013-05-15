'use strict'

rs = require('robotskirt')
renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML])
mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES])
$ = require 'jquery'
Assets = require './assets'
_ = require 'underscore'

class Chapter
  constructor: (doc) ->
    _.extend this, doc
  context = () ->
    context = {
      meta: @book.meta,
      assets: @book.assets,
      outline: @book.chapters
    }
    _.extend context, this
    return context

Object.defineProperty Chapter.prototype, 'html', {
  get: toHtml
  enumerable: true
}
toHtml = ->
  switch @type
    when 'md'
      processHTML mdparser.render chapter.body
    when 'html'
      processHTML chapter.body
    when 'hbs'
      bodytemplate = handlebars.compile chapter.body
      processHTML bodytemplate(chapter.context())
    when 'xhtml'
      chapter.body

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
  resolver.resolve(@toHtml)


module.exports = Chapter