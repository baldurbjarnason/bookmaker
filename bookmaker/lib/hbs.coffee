'use strict'

path = require('path')
html5 = require('html5')
parser = new html5.Parser()
serializeOpts = {
  minimize_boolean_attributes: false,
  lowercase: true,
}


register = (Handlebars, book) ->
  book.chapterIndex = 1
  book.navPoint = 1
  book.globalCounter = 0
  Handlebars.registerHelper 'chapterIndex', ->
    book.chapterIndex++
    return book.chapterIndex

  Handlebars.registerHelper 'navPoint', ->
    book.navPoint++
    return book.navPoint

  Handlebars.registerHelper 'globalCounter', ->
    book.globalCounter++
    counter = "c" + book.globalCounter
    return counter

  Handlebars.registerHelper 'chapterId', (filepath) ->
    chapterId = 'chapter-' + path.basename(filepath, '.html')
    return chapterId

  Handlebars.registerHelper 'basename', (filename) ->
    path.basename(filename)

  Handlebars.registerHelper 'relative', (current, filename) ->
    if current is filename
      path.basename filename
    else
      path.relative(path.dirname(path.resolve(current)), path.resolve(filename))


  renderHtmlToc = (outline) ->
    toc = ""
    for doc in outline
      do (doc) ->
        if doc.toc?
          toc = "<reference type='toc' title='Contents' href='#{doc.filename}'></reference>"
    return new Handlebars.SafeString(toc)
  Handlebars.registerHelper 'opftoc', renderHtmlToc

  processHTML = (html) ->
    parser.parse("<div class='chapter' id='chapter'>#{html}</div>")
    doc = parser.tree.document
    _counter = {}
    counter = (elem) ->
      unless _counter[elem]
        _counter[elem] = 0
      _counter[elem] += 1
      return _counter[elem]
    firstp = parser.tree.document.getElementsByTagName('p')[0]
    # firstp = doc.findall('.//p')[0]
    if firstp.className
      firstp.className = firstp.className + ' firstparagraph'
    else
      firstp.className = 'firstparagraph'
    elements = ['p','img','h1','h2','h3','h4','div','blockquote','ul','ol','nav', 'li', 'a']
    for elem in elements
      do (elem) ->
        elems = doc.getElementsByTagName(elem)
        for el in elems
          do (el) ->
            unless el.id
              el.id = elem + '-' + counter(elem)
    readyHtml = html5.serialize(parser.tree.document.getElementById('chapter'), null, serializeOpts)
    return new Handlebars.SafeString(readyHtml)
  Handlebars.registerHelper 'process', processHTML
  return


module.exports = {
  'register': register
}

