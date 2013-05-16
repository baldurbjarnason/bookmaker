'use strict'

fs = require('fs')
path = require('path')
yaml = require('js-yaml')
Assets = require './assets'
Chapter = require './chapter'
SubOutline = require('./book').SubOutline


loadFile= (filename) ->
  file = fs.readFileSync(path.resolve(@root, 'chapters', filename), 'utf8')
  docs = []
  yaml.safeLoadAll mainfile, (doc) ->
    docs.push(doc)
  doc = docs[0]
  doc.body = docs[1] if docs[1]?
  doc.type = path.extname(filename).replace(".","")
  basepath = path.basename filename, path.extname filename
  doc.filename = 'chapters/' + basepath + '.html'
  doc.render = true
  @addChapter(new Chapter(doc))

loadTxt = (booktxt) ->
  suboutline = []
  builtIns =  {
    'toc': {
      id: 'nav',
      filename: 'index.html',
      render: false,
      title: 'Table of Contents',
      nomanifest: true,
      majornavitem: true,
      template: 'nav.hbs',
      toc: true
    },
    'title': {
      id: 'titlepage',
      filename: 'title.html',
      title: 'Title Page',
      render: true,
      template: 'title.hbs',
      majornavitem: true
    },
    'titletoc': {
      id: 'titletoc',
      filename: 'title.html',
      title: 'Contents',
      render: true,
      template: 'titletoc.hbs',
      majornavitem: true,
      toc: true
    },
  }
  list = booktxt.trim().split(/\n/)
  emptyline = /^\s$/
  indentregex =  /^[ \t]+/
  for filename in list
    if builtIns[filename]
      @addChapter(new Chapter(builtIns[filename]))
    else if (filename[0] is '#') or (filename.match(emptyline))
      # Do nothing
    else if filename.match(indentregex)
      unless index
        subparent = @chapters[@chapters.length - 1]
        index = true
      filename = filename.trim()
      suboutline.push(filename)
    else
      @loadFile(filename)
      if index
        subparent.sub =  new SubOutline(subOutline, this)
        index = false
        suboutline = []
    return
  return this

module.exports = {
  extend: (Book) ->
    Book.prototype.loadTxt = loadTxt
    Book.prototype.loadFile = loadFile
}