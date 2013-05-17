'use strict'

fs = require('fs')
yaml = require('js-yaml')
bookmaker = require 'index'
Assets = bookmaker.Assets
Chapter = bookmaker.Chapter
Book = bookmaker.Book
SubOutline = bookmaker.SubOutline
whenjs = require('when')

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
  if docs[0].assetsFolder and !assets
    return
  resolver.resolve arrayToBook docs

# Needs a toYaml
# Write epub2yaml, epub2bookFolder, epub2json, epub2html scripts