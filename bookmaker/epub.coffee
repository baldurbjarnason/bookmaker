'use strict'

zipStream = require('zipstream-contentment')
handlebars = require('handlebars')
helpers = require('./lib/hbs.js')
whenjs = require('when')
callbacks = require 'when/callbacks'
# templates = require '../lib/templates'
path = require('path')
glob = require 'glob'
fs = require 'fs'
mangler = require './lib/mangler'
sequence = require('when/sequence')



# Each of these needs epubManifest, epubNCX, navList, html, epubSpine
# Book needs a chapter getter that is a flat list of all chapters including those in suboutline and a htmltocref
# Or an everyChapter(callback) method that runs once for every chapter with callback(chapter)
# landmarksOPF -> returns all guide reference for the OPF
# landmarksHTML -> returns all landmarks for index nav.
# Labels are chapters that lack a filename and generate no spine, ncx, or manifest entries.

chapterTemplates = {
  manifest: '{{#if this.nomanifest }}
    {{else}}{{#if filename }}<item id="{{ id }}" href="{{ filename }}" media-type="application/xhtml+xml"{{#if svg }} properties="svg"{{/if}}/>\n{{/if}}{{#if subChapters.epubManifest}}
    {{ subChapters.epubManifest }}{{/if}}{{/if}}'
  spine: '{{#if filename }}<itemref idref="{{ id }}" linear="yes"></itemref>\n{{/if}}{{#if subChapters.epubManifest}}
    {{ subChapters.epubSpine }}{{/if}}'
  nav: '<li class="tocitem {{ id }}{{#if majornavitem}} majornavitem{{/if}}" id="toc-{{ id }}">{{#if filename }}<a href="{{ filename }}">{{/if}}{{ title }}{{#if filename }}</a>\n{{/if}}
{{ subChapters.navList }}
</li>\n'
  ncx: '''
{{#if filename }}<navPoint id="navPoint-{{ book.navPoint }}" playOrder="{{ book.chapterIndex }}">
  <navLabel>
      <text>{{ title }}</text>
  </navLabel>
  <content src="{{ filename }}"></content>
{{ subChapters.epubNCX }}</navPoint>{{else}}
 {{ subChapters.epubNCX }}
{{/if}}'''
}

bookTemplates = {
  manifest: '{{#each chapters }}{{{ this.epubManifest }}}{{/each}}'
  spine: '{{#each chapters }}{{{ this.epubSpine }}}{{/each}}'
  nav: '{{#each chapters }}{{{ this.navList }}}{{/each}}'
  ncx: '{{#each chapters }}{{{ this.epubNCX }}}{{/each}}'
}

for own tempname, template of chapterTemplates
  chapterTemplates[tempname] = handlebars.compile template

for tempname, template of bookTemplates
  bookTemplates[tempname] = handlebars.compile template

templates = {}
newtemplates = glob.sync(path.resolve module.filename, '../../', 'templates/**/*.hbs')
newtemplates.concat(glob.sync('templates/**/*.hbs'))
# newtemplates.concat(glob.sync(path.join(@root, 'templates/**/*.hbs')))
for temppath in newtemplates
  name = path.basename temppath, path.extname temppath
  template = fs.readFileSync temppath, 'utf8'
  templates[name] = handlebars.compile template

extendChapter = (Chapter) ->
  Object.defineProperty Chapter.prototype, 'epubManifest', {
    get: ->
      manifest = chapterTemplates.manifest(@context())
      return manifest
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'epubSpine', {
    get: ->
      chapterTemplates.spine(@context())
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'navList', {
    get: ->
      chapterTemplates.nav(@context())
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'epubNCX', {
    get: ->
      chapterTemplates.ncx(@context())
    enumerable: true
  }

  Chapter.prototype.addToZip = (zip) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    context = @context
    fn = @filename
    process.nextTick(() ->
      zip.addFile(templates.chapters(context()), { name: fn }, deferred.resolve))
    return promise
  return Chapter

extendBook = (Book) ->
  # Object.defineProperty Book.prototype, 'chapterList', {
  #   get: ->
  #     findSubs(@chapters)
  #   enumerable: true
  # }

  Object.defineProperty Book.prototype, 'epubManifest', {
    get: ->
      bookTemplates.manifest(this)
    enumerable: true
  }

  Object.defineProperty Book.prototype, 'epubSpine', {
    get: ->
      bookTemplates.spine(this)
    enumerable: true
  }

  Object.defineProperty Book.prototype, 'navList', {
    get: ->
      bookTemplates.nav(this)
    enumerable: true
  }

  Object.defineProperty Book.prototype, 'epubNCX', {
    get: ->
      bookTemplates.ncx(this)
    enumerable: true
  }
  Object.defineProperty Book.prototype, 'chapterIndex', {
    get: ->
      @_chapterIndex++
      return @_chapterIndex
    enumerable: true
  }
  Object.defineProperty Book.prototype, 'navPoint', {
    get: ->
      @_navPoint++
      return @_navPoint
    enumerable: true
  }

  chapterTask = (chapter, zip) ->
    return () ->
      chapter.addToZip(zip)
  Book.prototype.addChaptersToZip = (zip) ->
    tasks = []
    for chapter in @chapters
      tasks.push(chapterTask(chapter, zip))
    sequence tasks

  Book.prototype.toEpub = toEpub

  return Book

toEpub = (out) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  renderEpub(this, out, deferred.resolver)
  return promise

renderEpub = (book, out, resolver) ->
  zip = zipstream.createZip({ level: 1 })
  zip.pipe(out)
  zip.add = callbacks.lift(zip.addFile)
  zip.final = callbacks.lift(zip.finalize)
  zippromises = [zip.add('''
      <?xml version="1.0" encoding="UTF-8"?>
      <display_options>
        <platform name="*">
          <option name="specified-fonts">true</option>
        </platform>
      </display_options>
      ''', { name: 'META-INF/com.apple.ibooks.display-options.xml' }),
    zip.add("application/epub+zip", { name: 'mimetype'}),
    zip.add('''
      <?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />
        </rootfiles>
      </container>
      ''', 'container.xml'),
    zip.add(fs.createReadStream(path.join(book.root, 'cover.jpg')), { name: 'cover.jpg'}),
    zip.add(@templates.content(book.context), { name: 'content.opf' }),
    zip.add(@templates.cover(book.context), { name: 'cover.html' }),
    zip.add(@templates.toc(book.context), { name: 'toc.ncx' }),
    zip.add(@templates.nav(book.context), { name: 'index.html' }),
    book.addChaptersToZip(zip),
    book.assets.addToZip(zip)]
  if book.sharedAssets
    zippromises.push(book.sharedAssets.addToZip(zip))
  if options.obfuscateFonts
    zippromises.push(book.assets.mangleFonts(zip, book.id))
  whenjs.all(zippromises).then(zip.final()).then(resolver.resolved, resolver.reject)


  # zip.addFile(fs.createReadStream('README.md'), { name: 'README.md' }, function() {
 #      zip.addFile(fs.createReadStream('example.js'), { name: 'example.js' }, function() {
 #        zip.finalize(function(written) { console.log(written + ' total bytes written'); });
 #      });
 #    });

extendAssets = (Assets) ->
  zipTask = (item, root, zip) ->
    return () ->
      deferred = whenjs.defer()
      promise = deferred.promise
      process.nextTick(() ->
        file = fs.readFile(root + item, (err, data) ->
          if err
            deferred.reject
          else
            zip.addFile(data, { name: item }, deferred.resolve)))
      return promise
  mangleTask = (item, root, zip, id) ->
    return () ->
      deferred = whenjs.defer()
      promise = deferred.promise
      process.nextTick(() ->
        fs.readFile(root + item, (err, data) ->
          if err
            deferred.reject
          else
            file = mangler.mangle(data, id)
            zip.addFile(file, { name: item }, deferred.resolve)))
      return promise

  Assets.prototype.addToZip = (zip) ->
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    tasks = []
    for type in types
      tasks.push(@addTypeToZip.bind(this, type, zip))
    sequence tasks
  Assets.prototype.addTypeToZip = (type, zip) ->
    tasks = []
    for item in this[type]
      tasks.push(zipTask(item, @root, zip))
    sequence tasks
  Assets.prototype.addMangledFontsToZip = (zip, id) ->
    tasks = []
    for item in this['otf']
      tasks.push(mangleTask(item, @root, zip, id))
    for item in this['ttf']
      tasks.push(mangleTask(item, @root, zip, id))
    for item in this['woff']
      tasks.push(mangleTask(item, @root, zip, id))
    sequence tasks
  Assets.prototype.mangleFonts = (zip, id) ->
    fonts = @ttf.concat(@otf, @woff)
    @addMangledFontsToZip(zip, id).then(()->
      deferred = whenjs.defer()
      promise = deferred.promise
      process.nextTick(() ->
        zip.addFile(templates.encryption(fonts), { name: 'META-INF/encryption.xml' }, deferred.resolve))
      return promise)
  return Assets

module.exports = {
  extend: (Chapter, Book, Assets) ->
    extendChapter Chapter
    extendBook Book
    extendAssets Assets
  extendChapter: extendChapter
  extendBook: extendBook
  extendAssets: extendAssets
}