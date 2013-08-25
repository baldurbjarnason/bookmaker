'use strict'

fs = require('fs')
path = require('path')
utilities = require './utilities'
Zip = require 'adm-zip'
xml2js = require('xml2js')
parser = new xml2js.Parser({ explicitCharkey: true, explicitArray: true })
parseString = parser.parseString
$ = require 'jquery'
async = require 'async'
log = require('./logger').logger()
mangler = require './mangler'
mangle = mangler.mangle


bodyre = new RegExp('(<body[^>]*>|</body>)', 'ig')

class EpubLoaderMixin
  @fromEpub = (epubpath, assetsroot, callback) ->
    epub = new Zip(epubpath)
    Chapter = @Chapter
    Book = this
    Assets = @Assets
    preBook = {} # both book state and meta will be attached to this object
    log.info "Extraction starting"
    findOpf = (callback) ->
      xml = epub.readAsText 'META-INF/container.xml'
      log.info "EPUB – Finding opf file"
      parseString xml, (err, result) ->
        if err
          log.error err
          callback err
        rootfile = result.container.rootfiles[0].rootfile[0].$['full-path']
        log.info "EPUB – Path to opf file is /#{rootfile}"
        preBook.opfpath = rootfile
        preBook.basedir = path.dirname preBook.opfpath
        callback null, rootfile

    extractOpf = (callback) ->
      parseString epub.readAsText(preBook.opfpath), (err, result) ->
        if err
          log.error err
          callback err
        createMetaAndSpine result, callback

    createMetaAndSpine = (xml, callback) ->
      metadata = xml.package.metadata[0]
      preBook.meta = meta = {}
      uid = xml.package.$['unique-identifier']
      for elem in metadata['dc:identifier']
        if elem.$['id'] is uid
          meta.bookId = elem._
      meta.specifiedCss = true
      meta.specifiedJs = true
      if metadata['dc:creator']
        meta.author = metadata['dc:creator'][0]._
      else
        log.warn 'Author metadata not set (dc:creator)'
      if metadata['dc:title']
        meta.title = metadata['dc:title'][0]._
      else
        log.warn 'Title not set (dc:title)'
      meta.author2 = metadata['dc:creator'][1]._ if metadata['dc:creator'][1]
      if meta.lang = metadata['dc:language']
        meta.lang = metadata['dc:language'][0]._
      else
        log.warn 'Language metadata not set (dc:language)'
      if metadata['dc:date']
        meta.date = metadata['dc:date'][0]._
      else
        log.warn "Date not set (dc:date)"
      if metadata['dc:rights']
        meta.rights = metadata['dc:rights'][0]._
      else
        log.warn "Rights metadata not set (dc:rights)"
      if metadata['dc:description']
        meta.description = metadata['dc:description'][0]._
      else
        log.warn "Description metadata not set (dc:description)"
      if metadata['dc:publisher']
        meta.publisher = metadata['dc:publisher'][0]._
      else
        log.warn "Publisher metadata not set (dc:publisher)"
      if metadata['dc:subject']
        meta.subject1 = metadata['dc:subject'][0]._
      else
        log.warn 'Subject not set (dc:subject)'
      if metadata['dc:subject'] and metadata['dc:subject'][1]
        meta.subject2 = metadata['dc:subject'][1]._
      if metadata['dc:subject'] and metadata['dc:subject'][2]
        meta.subject3 = metadata['dc:subject'][2]._
      for elem in metadata.meta
        if elem.$['property'] is "dcterms:modified"
          meta.modified = elem._
        if elem.$['name'] is 'cover'
          preBook.coverId = elem.$['content']
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
            if preBook.spine.indexOf(reference.$.href) isnt -1
              landmarks.push { type: type, title: reference.$.title, href: reference.$.href }
            else
              log.warn "Landmark #{type} isn't in the spine"
        if landmarks.length > 0
          meta.landmarks = landmarks
      log.info 'EPUB – OPF parsed and worked'
      callback null, xml

    extractLandmarks = (index, element) ->
      type = $(this).attr('epub:type')
      title = $(this).text()
      href = $(this).attr('href')
      if preBook.spine.indexOf(href) isnt -1
        preBook.landmarks.push { type: type, title: title, href: href }
      else
        log.warn "Landmark #{type} isn't in the spine"


    processNav = (callback) ->
      xml = epub.readAsText(path.join preBook.basedir, preBook.navPath)
      body = xml.split(bodyre)[2]
      $('body').html(body)
      preBook.landmarks = []
      $('nav[epub\\:type=landmarks] a[epub\\:type]').each(extractLandmarks)
      unless preBook.landmarks.length is 0
        preBook.meta.landmarks = preBook.landmarks
      preBook.outline = $('nav[epub\\:type=toc]').html()
      preBook.pageList = $('nav[epub\\:type=page-list]').html()
      log.info 'EPUB – Nav parsed and worked'
      callback null, xml

    extractAssetsAndCreateBook = (callback) ->
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
      preBook.book.outline = preBook.outline
      log.info 'EPUB – assets extracted'
      callback null, preBook.book
    
    parseChapter = (xml, chapterpath, callback) ->
      chapterpath = unescape chapterpath
      parseString xml, (err, result) ->
        log.info "EPUB – Parsing #{chapterpath}"
        if err
          log.error err
          callback err
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
        callback null, chapter

    extractChapters = (callback) ->
      chapters = []
      for chapter in preBook.spine
        chapterpath = path.join preBook.basedir, chapter
        chapterpath = unescape chapterpath
        xml = epub.readAsText(chapterpath)
        chapters.push parseChapter.bind(null, xml, chapter)
      log.info 'EPUB – extracting chapters'
      async.series chapters, callback

    unMangle = (callback) ->
      xml = epub.readAsText 'META-INF/encryption.xml'
      parseString xml, (err, result) ->
        if err
          log.error err
          callback err
        if result
          fontpaths = []
          for eData in result.encryption['enc:EncryptedData']
            if eData['enc:EncryptionMethod'][0].$['Algorithm'] is 'http://www.idpf.org/2008/embedding'
              fontpaths.push eData[ 'enc:CipherData'][0]['enc:CipherReference'][0].$['URI']
          log.info "EPUB – unmangling fonts"
          for fontpath in fontpaths
            font = fs.readFileSync(path.join(assetsroot, fontpath), )
            fs.writeFileSync(path.join(assetsroot, fontpath), mangle(font, preBook.book.meta.bookId))
          callback()
        else
          callback()



    done = () ->
      callback null, preBook.book

    tasks = [findOpf, extractOpf, processNav, extractAssetsAndCreateBook, extractChapters, unMangle, done]
    async.series tasks

extend = (Book) ->
  utilities.mixin Book, EpubLoaderMixin

module.exports = {
  extend: extend
  EpubLoaderMixin: EpubLoaderMixin
}