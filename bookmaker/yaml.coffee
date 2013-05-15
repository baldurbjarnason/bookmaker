'use strict'

fs = require('fs')
yaml = require('js-yaml')
Assets = require './assets'
Chapter = require './chapter'
book = require './book'

titlecounter = 0
titlegen = (chapter) ->
  title = titlere.exec(chapter)[1]
  if title
    return title
  else
    titlecounter += 1
    title = titlecounter
    return title

yamlToBook = (docs) ->
  titlere = new RegExp('^# (.+)', 'm')
  meta = docs[0]
  chapters = docs.slice(1)
  mdBook = new book.Book(meta)
  for entry in chapters
    if entry.title
      chapter = new Chapter(entry)
      if entry.subChapters
        chapter.subChapters = new SubOutline(entry.subChapters, this)
    else
      chapter = new Chapter({
        title: titlegen(entry),
        type: 'md',
        body: entry
      })
    mdBook.addChapter(chapter)
  return mdBook

loadYaml = (filename, meta) ->
  yamlfile = fs.readFileSync filename, 'utf8'
  docs = []
  yaml.loadAll yamlfile,
    (doc) ->
      docs.push(doc)
      return
  if (typeof docs[0] is string) and (meta?)
    docs.unshift(meta)
    return docs

# Needs a toYaml
# Write epub2yaml, epub2bookFolder, epub2json, epub2html scripts