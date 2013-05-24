'use strict'

fs = require('fs')
path = require('path')
yaml = require('js-yaml')

extend = (Chapter, Book, Assets, SubOutline) ->
  Book.loadBookDir = (directory, Chap, Ass, Sub) ->
    Chapter = Chap || Chapter
    Assets = Ass || Assets
    SubOutline = Sub || SubOutline
    loadFile= (filename, book) ->
      file = fs.readFileSync(path.resolve(directory, 'chapters', filename), 'utf8')
      docs = []
      yaml.safeLoadAll file, (doc) ->
        docs.push(doc)
      doc = docs[0]
      doc.body = docs[1] if docs[1]?
      doc.type = path.extname(filename).replace(".","")
      basepath = path.basename filename, path.extname filename
      doc.filename = 'chapters/' + basepath + '.html'
      book.addChapter(new Chapter(doc))
    loadTxt = (booktxt, book) ->
      suboutline = []
      builtIns =  {
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
          book.addChapter(new Chapter(builtIns[filename]))
        else if (filename[0] is '#') or (filename.match(emptyline))
          # Do nothing
        else if filename.match(indentregex)
          unless index
            subparent = book.chapters[book.chapters.length - 1]
            index = true
          filename = filename.trim()
          suboutline.push(filename)
        else
          loadFile(filename, book)
          if index
            subparent.subChapters =  new SubOutline(suboutline, this)
            index = false
            suboutline = []
        return
      return book
    if fs.existsSync directory + 'meta.yaml'
      meta = yaml.safeLoad fs.readFileSync directory + 'meta.yaml', 'utf8'
    else if fs.existsSync directory + 'meta.json'
      meta = JSON.parse fs.readFileSync directory + 'meta.json', 'utf8'
    else
      return
    if meta.assetsPath
      assets = new Assets(directory, meta.assetsPath)
    else
      assets = new Assets(directory, 'assets/')
    NewBook = this
    book = new NewBook(meta, assets)
    if fs.existsSync directory + 'book.txt'
      booktxt = fs.readFileSync directory + 'book.txt', 'utf8'
    else
      return
    loadTxt(booktxt, book)
    return book


module.exports = {
  extend: extend
}