'use strict'

fs = require('fs')
yaml = require('js-yaml')
bookmaker = require './index'
Assets = bookmaker.Assets
Chapter = bookmaker.Chapter
Book = bookmaker.Book
SubOutline = bookmaker.SubOutline
whenjs = require('when')
_ = require 'underscore'
path = require 'path'
sequence = require('when/sequence')

titlecounter = 0
titlere = new RegExp('^# (.+)', 'm')
stripre = new RegExp('\W', 'g')
titlegen = (chapter) ->
  title = titlere.exec(chapter)[1]
  if title
    return title
  else
    titlecounter += 1
    title = titlecounter
    return title

chaptergen = (chapter) ->
  title = titlere.exec(chapter)[1]
  if title
    filename = title.replace(stripre, '') + '.html'
  else
    titlecounter += 1
    title = titlecounter
    filename = 'doc' + titlecounter + '.html'
  retur {
    title: title
    filename: filename
    type: 'md'
    body: chapter
  }

arrayToBook = (docs, assets) ->
  meta = docs[0]
  chapters = docs.slice(1)
  mdBook = new Book(meta, assets)
  for entry in chapters
    if typeof entry is 'string'
      chapter = new Chapter(chaptergen(entry))
    else
      chapter = new Chapter(entry)
      if entry.subChapters
        chapter.subChapters = new SubOutline(entry.subChapters, this)
    mdBook.addChapter(chapter)
  return mdBook

loadYaml = (filename, meta, assets) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  fs.readFile filename, 'utf8', (err, data) ->
    if err
      deferred.reject
    else
      yamlLoader data, filename, meta, deferred.resolver, assets
  return promise

yamlLoader = (data, filename, meta, resolver, assets) ->
  yamlfile = data
  docs = []
  yaml.safeLoadAll yamlfile,
    (doc) ->
      docs.push(doc)
      return
  if (typeof docs[0] is 'string') and (meta?)
    docs.unshift(meta)
  if docs[0].assetsPath and !assets
    root = path.dirname path.resolve(process.cwd(), filename)
    assets = new Assets(root, docs[0].assetsPath)
  resolver.resolve arrayToBook docs, assets

chapterToYaml = (chapter) ->
  entry = {}
  omitted =  _.methods(chapter)
  omitted.push('book')
  entry = _.omit chapter, omitted
  if chapter.subChapters
    entry.subChapters = []
    for subChapter in chapter.subChapters.chapters
      entry.subChapters.push(chapterToYaml subChapter)
  return entry

extend = (Book) ->
  Book.prototype.toYaml = (filename, options) ->
    directory = path.dirname filename + @assetsPath
    tasks = [@assets.copy(directory),
      yamlWriter(filename, options, this)]
    sequence tasks
  return Book

yamlWriter = (filename, options, book, resolver) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  if filename instanceof fs.WriteStream
    out = filename
  else
    out = fs.createWriteStream filename
  meta = {}
  _.extend meta, book.meta
  meta.date = book.meta.date.date.toString()
  out.write(yaml.safeDump(meta))
  out.write('\n---\n')
  for chapter in book.chapters
    entry = chapterToYaml chapter
    out.write(yaml.safeDump(entry))
    out.write('\n---\n')
  out.end(deferred.resolve)
  return promise

module.exports = {
  loadYaml: loadYaml
  extend: extend
}