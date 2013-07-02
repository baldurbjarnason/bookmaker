'use strict'

fs = require('fs')
path = require('path')
utilities = require './utilities'
Zip = require 'adm-zip'
xml2js = require('xml2js')
parser = new xml2js.Parser({ explicitCharkey: true, explicitArray: true })
parseString = parser.parseString
$ = require 'jquery'
whenjs = require('when')
sequence = require('when/sequence')
log = require('./logger').logger


bodyre = new RegExp('(<body[^>]*>|</body>)', 'ig')

class EpubLoaderMixin
  @fromEpub = (epubpath, assetsroot) ->
    epub = new Zip(epubpath)
    Chapter = @Chapter
    Book = this
    Assets = @Assets
    preBook = {} # both book state and meta will be attached to this object
    log.info "Extraction starting"
    findOpf = (xml) ->
      deferred = whenjs.defer()
      promise = deferred.promise
      log.info "EPUB – Finding opf file"
      parseString xml, (err, result) ->
        if err
          log.error err
        rootfile = result.container.rootfiles[0].rootfile[0].$['full-path']
        log.info "EPUB – Path to opf file is /#{rootfile}"
        preBook.opfpath = rootfile
        preBook.basedir = path.dirname preBook.opfpath
        deferred.resolve rootfile
      return promise

    extractOpf = (xml) ->
      deferred = whenjs.defer()
      promise = deferred.promise
      parseString xml, (err, result) ->
        if err
          log.error err
        createMetaAndSpine result, deferred
      return promise

    createMetaAndSpine = (xml, deferred) ->
      metadata = xml.package.metadata[0]
      preBook.meta = meta = {}
      uid = xml.package.$['unique-identifier']
      for elem in metadata['dc:identifier']
        if elem.$['id'] is uid
          meta.bookId = elem._
      meta.specifiedCss = true
      meta.specifiedJs = true
      meta.author = metadata['dc:creator'][0]._ if metadata['dc:creator']
      meta.title = metadata['dc:title'][0]._ if metadata['dc:title']
      meta.author2 = metadata['dc:creator'][1]._ if metadata['dc:creator'][1]
      meta.lang = metadata['dc:language'][0]._ if meta.lang = metadata['dc:language']
      meta.date = metadata['dc:date'][0]._ if metadata['dc:date']
      if metadata['dc:rights']
        meta.rights = metadata['dc:rights'][0]._
      if metadata['dc:description']
        meta.description = metadata['dc:description'][0]._
      if metadata['dc:publisher']
        meta.publisher = metadata['dc:publisher'][0]._
      meta.subject1 = metadata['dc:subject'][0]._ if metadata['dc:subject']
      if metadata['dc:subject'] and metadata['dc:subject'][1]
        meta.subject2 = metadata['dc:subject'][1]._
      if metadata['dc:subject'] and metadata['dc:subject'][2]
        meta.subject3 = metadata['dc:subject'][2]._
      for elem in metadata.meta
        if elem.$['property'] is "dcterms:modified"
          meta.modified = elem._
        if elem.$['name'] is 'cover'
          preBook.coverId = elem._
        if elem.$['property'] is 'ibooks:version'
          meta.version = elem._
      manifest = xml.package.manifest[0]
      log.info 'EPUB – Extracting metadata'
      preBook.spine = for item in xml.package.spine[0].itemref
        item.$.idref
      for elem in manifest.item
        if preBook.spine.indexOf(elem.$.id) isnt -1
          preBook.spine[preBook.spine.indexOf(elem.$.id)] = elem.$.href
        if elem.$.id is preBook.coverId
          meta.cover = elem.$.href
        if elem.$.properties
          props = elem.$.properties.split(' ')
          if props.indexOf('cover-image') isnt -1
            meta.cover = elem.$.href
          if props.indexOf('nav') isnt -1
            preBook.navPath = elem.$.href
      if xml.package.guide
        references = xml.package.guide[0].reference
        landmarks = []
        for reference in references
          if reference.$.type is 'text' or reference.$.type is 'start'
            type = 'bodymatter'
          else
            type = reference.$.type
          if reference.$.type is 'cover'
            preBook.spine = preBook.spine.filter (path) ->
              if path isnt reference.$.href
                return path
          else
            landmarks.push { type: type, title: reference.$.title, href: reference.$.href }
        if landmarks.length > 0
          meta.landmarks = landmarks
      log.info 'EPUB – OPF parsed and worked'
      deferred.resolve xml

    processNav = (xml) ->
      deferred = whenjs.defer()
      promise = deferred.promise
      body = xml.split(bodyre)[2]
      $('body').html(body)
      preBook.outline = $('nav[epub\\:type=toc]').html()
      deferred.resolve xml
      log.info 'EPUB – Nav parsed and worked'
      return promise

    extractAssetsAndCreateBook = () ->
      deferred = whenjs.defer()
      promise = deferred.promise
      assetslist = epub.getEntries().filter (entry) ->
        ext = path.extname entry.entryName
        if entry.entryName is 'mimetype'
          return false
        switch ext
          when '.html' then return false
          when '.xhtml' then return false
          when '.opf' then return false
          when '.ncx' then return false
          when '.xml' then return false
          else return true
      for entry in assetslist
        log.info "Extracting #{entry.entryName}"
        epub.extractEntryTo entry, assetsroot, true, true
      assetsroot = path.join(assetsroot, preBook.basedir) if preBook.basedir
      assets = new Assets(assetsroot, '.')
      preBook.book = new Book preBook.meta, assets
      deferred.resolve preBook.book
      log.info 'EPUB – assets extracted'
      return promise
    
    parseChapter = (xml, chapterpath) ->
      deferred = whenjs.defer()
      promise = deferred.promise
      chapterpath = unescape chapterpath
      parseString xml, (err, result) ->
        log.info "EPUB – Parsing #{chapterpath}"
        if err
          log.error err
        chapter = {}
        chapter.title = result.html.head[0].title[0]._
        chapter.type = 'xhtml'
        chapter.body = xml.split(bodyre)[2]
        chapter.filename = chapterpath
        links = result.html.head[0].link
        css = []
        _links = {}
        if links
          for link in links
            if link.$.type is 'text/css'
              css.push link.$.href
            else
              _links[link.$.rel] = { type: link.$.type, href: link.$.href }
              if link.$.hreflang
                _links[link.$.rel].hreflang = link.$.hreflang
        chapter.css = css
        scripts = result.html.head[0].scripts
        js = []
        if scripts
          for script in scripts
            js.push script.$.src
        preBook.book.addChapter new Chapter(chapter)
        deferred.resolve chapter
      return promise

    extractChapters = (book) ->
      deferred = whenjs.defer()
      promise = deferred.promise
      chapters = []
      for chapter in preBook.spine
        chapterpath = path.join preBook.basedir, chapter
        chapterpath = unescape chapterpath
        xml = epub.readAsText(chapterpath)
        chapters.push parseChapter.bind(null, xml, chapter)
      log.info 'EPUB – extracting chapters'
      sequence chapters
    done = () ->
      return preBook.book

    opfpath = findOpf epub.readAsText 'META-INF/container.xml'
    # Extract OPF file and create meta object
    promise = opfpath
      .then((path) -> extractOpf(epub.readAsText(path)))
      .then(() -> processNav(epub.readAsText(preBook.navPath)))
      .then(() -> extractAssetsAndCreateBook())
      .then((book) -> extractChapters(book)) # Remember to suppress cover html file and skip nav
      .then(() -> done())
    return promise

extend = (Book) ->
  utilities.mixin Book, EpubLoaderMixin

module.exports = {
  extend: extend
  EpubLoaderMixin: EpubLoaderMixin
}