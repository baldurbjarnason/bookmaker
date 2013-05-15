'use strict'

zipStream = require('zipstream-contentment')
handlebars = require('handlebars')
helpers = require('./lib/hbs.js')
whenjs = require('when')
callbacks = require 'when/callbacks'
templates = require '../lib/templates'
path = require('path')
glob = require 'glob'
fs = require 'fs'
mangler = require './lib/mangler'



# Each of these needs epubManifest, epubNCX, navList, html, epubSpine
# Book needs a chapter getter that is a flat list of all chapters including those in suboutline and a htmltocref
# Or an everyChapter(callback) method that runs once for every chapter with callback(chapter)
# landmarksOPF -> returns all guide reference for the OPF
# landmarksHTML -> returns all landmarks for index nav.
# Labels are chapters that lack a filename and generate no spine, ncx, or manifest entries.

chapterTemplates = {
  manifest: '{{#if filename }}<item id="{{ id }}" href="{{ filename }}" media-type="application/xhtml+xml"
    {{#if svg }}properties="svg"{{/if}}/>{{/if}}
    {{ subChapters.epubManifest }}'
  spine: '{{#if filename }}<itemref idref="{{ id }}" linear="yes"></itemref>{{/if}}
    {{ subChapters.epubSpine }}'
  nav: '<li class="tocitem {{ id }}{{#if majornavitem}} majornavitem{{/if}}" id="toc-{{ id }}">{{#if filename }}<a href="{{ filename }}">{{/if}}{{ title }}{{#if filename }}</a>{{/if}}
    {{ subChapters.navList }}
    </li>'
  ncx: '{{#if filename }}<navPoint id="navPoint-{{ navPoint }}" playOrder="{{ chapterIndex }}">
            <navLabel>
                <text>{{ title }}</text>
            </navLabel>
            <content src="{{ filename }}"></content>
            {{ subChapters.epubNCX }}
        </navPoint>{{else}}
         {{ subChapters.epubNCX }}
        {{/if}}'
}

bookTemplates = {
  manifest: '{{#each chapters }}{{ this.epubManifest }}{{/each}}'
  spine: '{{#each chapters }}{{ this.epubSpine }}{{/each}}'
  nav: '{{#each chapters }}{{ this.navList }}{{/each}}'
  ncx: '{{#each chapters }}{{ this.epubNCX }}{{/each}}'
}

for template of chapterTemplates
  chapterTemplates[template] = handlebars.compile template


for template of bookTemplates
  bookTemplates[template] = handlebars.compile template

extendChapter = (Chapter) ->
  Object.defineProperty Chapter.prototype, 'epubManifest', {
    get: ->
      chapterTemplates.manifest(this)
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'epubSpine', {
    get: ->
      chapterTemplates.spine(this)
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'navList', {
    get: ->
      chapterTemplates.nav(this)
    enumerable: true
  }

  Object.defineProperty Chapter.prototype, 'epubNCX', {
    get: ->
      chapterTemplates.ncx(this)
    enumerable: true
  }

  Chapter.prototype.addToZip = (book, zip) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    @addToZipFn(book, zip, deferred.resolver)
    return promise
  Chapter.prototype.addToZipFn = (book, zip, resolver) ->
    @htmlPromise.then(respond, resolver.reject)
    context = @context()
    fn = @filename
    respond = (html) ->
      zip.add(@book.templates.chapter(context), { name: fn })
      resolver.resolve(fn)
    return
  return Chapter

extendBook = (Book) ->
  Object.defineProperty Book.prototype, 'chapterList', {
    get: ->
      findSubs(@chapters)
    enumerable: true
  }

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
  Book.prototype.addChaptersToZip = (zip) ->
    chapterFn = (chapter) ->
      chapter.addToZip(this, zip)
    whenjs.map(@chapters, chapterFn)

  Book.prototype.toEpub = toEpub

  newtemplates = glob.sync(path.resolve module.filename, '../../', 'templates/**/*.hbs')
  newtemplates.concat(glob.sync('templates/**/*.hbs'))
  # newtemplates.concat(glob.sync(path.join(@root, 'templates/**/*.hbs')))
  for temppath in newtemplates
    name = path.basename temppath, path.extname temppath
    template = fs.readFileSync temppath, 'utf8'
    templates[name] = handlebars.compile template

  Book.prototype.templates = templates

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
  Assets.prototype.addToZip = (zip) ->
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff']
    promises = []
    for type in types
      promises.push(@addTypeToZip(type, zip))
    whenjs.all(promises)
  Assets.prototype.addTypeToZip = (type, zip) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    mapFn = (item) ->
      file = fs.readFileSync @root + item
      zip.add(file, { name: item })
    getAssets(type, mapFn, deferred.resolver)
    return promise
  Assets.prototype.addMangledFontsToZip = (type, zip, id) ->
    deferred = whenjs.defer()
    promise = deferred.promise
    mapFn = (item) ->
      file = mangler.mangle(fs.readFileSync @root + item, id)
      zip.add(file, { name: item })
    getAssets(type, mapFn, deferred.resolver)
    return promise
  Assets.prototype.mangleFonts = (zip, id) ->
    alltypes = [@addMangledFontsToZip('woff', zip, id),
    @addMangledFontsToZip('ttf', zip, id),
    @addMangledFontsToZip('otf', zip, id)]
    fonts = @ttf.concat(@otf, @woff)
    whenjs.all(alltypes).then(()-> zip.add(@templates.encryption(fonts), { name: 'META-INF/encryption.xml' } ))
  Assets.prototype.getAssets = (type, fn, resolver) ->
    whenjs.map(this[type], fn).then(resolver.resolve, resolver.reject)
  return Assets

module.exports = {
  extend: (Chapter, Book, Assets) ->
    extendChapter Chapter
    extendBook Book
    extendAssets Assets
}