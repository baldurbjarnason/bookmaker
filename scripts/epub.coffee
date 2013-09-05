'use strict'

zipStream = require('zipstream-contentment')
async = require 'async'
path = require('path')
glob = require 'glob'
fs = require 'fs'
mangler = require './mangler'
utilities = require './utilities'
relative = utilities.relative
pageLinks = utilities.pageLinks
addToZip = utilities.addToZip
addStoredToZip = utilities.addStoredToZip
logger = require('./logger')
nunjucks = require 'nunjucks'
env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), { autoescape: false })
env.getTemplate('cover.xhtml').render()
Chapter = require './chapter'

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
  chapter.svg = chapter.svg || []
  chapter.js = chapter.js || []
  if chapter.svg.length isnt 0
    properties.push('svg')
  if (chapter.js.length isnt 0) or (@assets.js.toString() isnt "" and !@specifiedJs)
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
  logger.log.info 'EPUB – Landmarks prepared'
  return landmarks

generateChapters = (book) ->
  if book.generate.htmlToc
    toc = {
      title: 'Table of Contents'
      type: 'html'
      filename: 'htmltoc.html'
      body: env.getTemplate('htmltoc.xhtml').render(book)
    }
    book.prependChapter new Chapter(toc)
    book.meta.landmarks.push {
      type: 'toc'
      title: 'Table of Contents'
      href: 'htmltoc.html'
    }
  copyright = {
    title: 'Copyright'
    type: 'md'
    filename: 'copyright.html'
    body: "Copyright #{book.meta.copyrightYear} #{book.meta.author}, all rights reserved."
  }
  if book.generate.copyrightFront
    book.prependChapter new Chapter(copyright)
  if book.generate.copyrightBack
    book.addChapter new Chapter(copyright)
  if book.generate.copyrightFront or book.generate.copyrightBack
    book.meta.landmarks.push {
      type: 'copyright-page'
      title: 'Copyright'
      href: 'copyright.html'
    }
  if book.generate.title
    titlepage = {
      title: book.meta.title
      type: 'md'
      filename: 'titlepage.html'
      body: "# #{book.meta.title}\n\n## by #{book.meta.author}"
    }
    book.prependChapter new Chapter(titlepage)
    book.meta.landmarks.push {
      type: 'titlepage'
      title: 'Title Page'
      href: 'titlepage.html'
    }


toEpub = (out, options, callback) ->
  logger.log.info 'Rendering EPUB'
  book = Object.create this
  zip = zipStream.createZip({ level: 1 })
  zip.pipe(out)
  final = (err, result) ->
    if err
      callback(err)
    logger.log.info 'Finishing...'
    zip.finalize((written) ->
      callback(null, written))
  renderEpub(book, out, options, zip, final)

renderEpub = (book, out, options, zip, callback) ->
  book._state = {}
  book._state.htmltype = "application/xhtml+xml"
  book.counter = utilities.countergen()
  book.meta.landmarks = processLandmarks(book.meta.landmarks)
  book.isCover = isCover.bind(book)
  book.links = pageLinks(book, book)
  book.chapterProperties = chapterProperties.bind(book)
  book.idGen = utilities.idGen
  if optons?.sanitize
    book.sanitize = true
  book.exclude = options.exclude if options and options.exclude
  generateChapters book
  tasks = []
  tasks.push(addStoredToZip.bind(null, zip, 'mimetype', "application/epub+zip"))
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
      '''))
  if book.meta.cover
    tasks.push(addToZip.bind(null, zip, 'cover.html', env.getTemplate('cover.xhtml').render.bind(env.getTemplate('cover.xhtml'), book)))
  tasks.push(addToZip.bind(null, zip, 'toc.ncx', env.getTemplate('toc.ncx').render.bind(env.getTemplate('toc.ncx'), book)))
  tasks.push(addToZip.bind(null, zip, 'index.html', env.getTemplate('index.xhtml').render.bind(env.getTemplate('index.xhtml'), book)))
  tasks.push(book.addChaptersToZip.bind(book, zip, env.getTemplate('chapter.xhtml')))
  if options?.exclude
    tasks.push(book.assets.addToZip.bind(book.assets, zip, options))
  else
    tasks.push(book.assets.addToZip.bind(book.assets, zip))
  tasks.push(addToZip.bind(null, zip, 'content.opf', env.getTemplate('content.opf').render.bind(env.getTemplate('content.opf'), book)))
  if options?.obfuscateFonts or book.obfuscateFonts
    tasks.push(book.assets.mangleFonts.bind(book.assets, zip, book.meta.bookId))
  async.series(tasks, callback)

extendAssets = (Assets) ->
  mangleTask = (item, assets, zip, id, callback) ->
    assets.get(item, (err, data) ->
      file = mangler.mangle(data, id)
      zip.addFile(file, { name: item }, callback))

  Assets.prototype.addMangledFontsToZip = (zip, id, callback) ->
    tasks = []
    for item in this['otf']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    for item in this['ttf']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    for item in this['woff']
      tasks.push(mangleTask.bind(null, item, this, zip, id))
    async.series tasks, callback
  Assets.prototype.mangleFonts = (zip, id, callback) ->
    fonts = @ttf.concat(@otf, @woff)
    @addMangledFontsToZip(zip, id, ()->
      zip.addFile(env.getTemplate('encryption.xml').render({fonts: fonts }), { name: 'META-INF/encryption.xml' }, callback))
  return Assets

module.exports = {
  extend: (Book, Assets) ->
    extendBook Book
    extendAssets Assets
  extendBook: extendBook
  extendAssets: extendAssets
}