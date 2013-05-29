'use strict'

zipStream = require('zipstream-contentment')
whenjs = require('when')
sequence = require('when/sequence')
callbacks = require 'when/callbacks'
path = require('path')
glob = require 'glob'
fs = require 'fs'
mangler = require './lib/mangler'
_ = require 'underscore'
temp = require './templates'
templates = temp.templates
utilities = require './utilities'
relative = utilities.relative
pagelinks = utilities.pageLinks
addToZip = utilities.addToZip

extendBook = (Book) ->
  Book.prototype.toEpub = toEpub
  return Book

isCover = (path) ->
  if @meta.cover is path
    return ' properties="cover-image"'
  else
    return ""

chapterProperties = (chapter) ->
  properties = []
  if chapter.svg
    properties.push('svg')
  if chapter.js or (@assets.js.toString() isnt "" and !@specifiedJs)
    properties.push('scripted')
  prop = properties.join(' ')
  if properties.toString() isnt ""
    return "properties='#{prop}'"
  else
    return ""

processLandmarks = (landmarks) ->
  unless landmarks
    return
  landmarks = for landmark in landmarks
    do (landmark)  ->
      if landmark.type is 'bodymatter'
        landmark.opftype = "text"
      else
        landmark.opftype = landmark.type
      return landmark
  console.log landmarks
  return landmarks

toEpub = (out, options) ->
  book = Object.create this
  zip = zipStream.createZip({ level: 1 })
  zip.pipe(out)
  final = () ->
    deferred = whenjs.defer()
    promise = deferred.promise
    deferred.notify 'Writing to file...'
    zip.finalize(deferred.resolve)
    return promise
  renderEpub(book, out, options, zip).then(final)

renderEpub = (book, out, options, zip) ->
  book._state = {}
  book._state.htmltype = "application/xhtml+xml"
  book.counter = utilities.countergen()
  book.meta.landmarks = processLandmarks(book.meta.landmarks)
  book.isCover = isCover.bind(book)
  book.links = pagelinks(book, book)
  book.chapterProperties = chapterProperties.bind(book)
  tasks = []
  tasks.push(addToZip.bind(null, zip, 'mimetype', "application/epub+zip", true))
  tasks.push(addToZip.bind(null, zip, 'META-INF/com.apple.ibooks.display-options.xml', '''
      <?xml version="1.0" encoding="UTF-8"?>
      <display_options>
        <platform name="*">
          <option name="specified-fonts">true</option>
        </platform>
      </display_options>
      '''))
  tasks.push(addToZip.bind(null, zip, 'META-INF/container.xml', '''
    <?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />
        </rootfiles>
      </container>
      ''', 'META-INF/container.xml'))
  if book.meta.cover
    tasks.push(addToZip.bind(null, zip, 'cover.html', templates['cover.xhtml'].render.bind(templates, book)))
  tasks.push(addToZip.bind(null, zip, 'content.opf', templates['content.opf'].render.bind(templates, book)))
  tasks.push(addToZip.bind(null, zip, 'toc.ncx', templates['toc.ncx'].render.bind(templates, book)))
  tasks.push(addToZip.bind(null, zip, 'index.html', templates['index.xhtml'].render.bind(templates, book)))
  tasks.push(book.addChaptersToZip.bind(book, zip, templates['chapter.xhtml']))
  tasks.push(book.assets.addToZip.bind(book.assets, zip))
  if book.sharedAssets
    tasks.push(book.sharedAssets.addToZip.bind(book.sharedAssets, zip))
  if options?.assets
    tasks.push(options.assets.addToZip.bind(options.assets, zip))
  if options?.obfuscateFonts or book.obfuscateFonts
    tasks.push(book.assets.mangleFonts.bind(book.assets, zip, book.id))
  sequence(tasks)

extendAssets = (Assets) ->
  mangleTask = (item, assets, zip, id) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    assets.get(item).then((data) ->
      deferred.notify "Writing mangled #{item} to zip"
      file = mangler.mangle(data, id)
      zip.addFile(file, { name: item }, deferred.resolve))
    return promise

  Assets.prototype.addMangledFontsToZip = (zip, id) ->
    tasks = []
    for item in this['otf']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    for item in this['ttf']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    for item in this['woff']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    sequence tasks
  Assets.prototype.mangleFonts = (zip, id) ->
    fonts = @ttf.concat(@otf, @woff)
    @addMangledFontsToZip(zip, id).then(()->
      deferred = whenjs.defer()
      promise = deferred.promise
      zip.addFile(templates['encryption.xml'].render({fonts: fonts }), { name: 'META-INF/encryption.xml' }, deferred.resolve)
      return promise)
  return Assets

module.exports = {
  extend: (Book, Assets) ->
    extendBook Book
    extendAssets Assets
  extendBook: extendBook
  extendAssets: extendAssets
}