'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
SubOutline = index.SubOutline
Assets = index.Assets
zipStream = require('zipstream-contentment')
fs = require 'fs'
whenjs = require('when')
callbacks = require 'when/callbacks'

testoutline = {
  id: 'titlepage',
  filename: 'title.html',
  title: 'Title Page',
  render: true,
  template: 'title.hbs',
  majornavitem: true,
  subChapters: [
    {
      id: 'nav',
      filename: 'index.html',
      render: false,
      title: 'Table of Contents',
      nomanifest: true,
      majornavitem: true,
      toc: true
    },
    {
      id: 'titlepage',
      filename: 'title.html',
      title: 'Title Page',
      render: true,
      template: 'title.hbs',
      majornavitem: true
    },
    {
      id: 'titletoc',
      filename: 'title.html',
      title: 'Contents',
      render: true,
      template: 'titletoc.hbs',
      majornavitem: true,
      toc: true
    },
    {
      type: 'md'
      body: '# This is Markdown!'
    }]
}
testbook = {}
testchapters =  [{
    type: 'md',
    title: 'Markdown',
    body: '# header\n\nTest'
  },
  {
    type: 'html',
    id: 'htmlexample',
    filename: 'htmlexample.html',
    title: 'HTML',
    arbitraryMeta: 'is arbitrary'
    body: '<h1>header</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  },
  {
    type: 'xhtml',
    title: 'XHTML',
    body: '<h1>header</h1><p>Test<br/></p>'
  },
  {
    type: 'hbs',
    title: 'Template',
    body: '<h1>{{title}}</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  }
]

describe 'EpubChapter',
  () ->
    beforeEach (done) ->
      assets = new Assets("test/files/", "assets/")
      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum'}, assets)
      testbook.assets.init().then(() -> done())
    describe '#epubManifest',
      () ->
        it 'generates the xml manifest for epub',
          () ->
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].epubManifest.should.equal('<item id="htmlexample" href="htmlexample.html" media-type="application/xhtml+xml" properties=\"\"/>\n')
    describe '#epubSpine',
      () ->
        it 'generates the xml spine for epub',
          () ->
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].epubSpine.should.equal('<itemref idref="htmlexample" linear="yes"></itemref>\n')
    describe '#navList',
      () ->
        it 'generates the html nav li entry for epub',
          () ->
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].navList.should.equal('<li class="tocitem htmlexample" id="toc-htmlexample"><a href="htmlexample.html">HTML</a>\n</li>\n')
    describe '#epubNCX',
      () ->
        it 'generates the xml NCX entry for epub',
          () ->
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].epubNCX.should.equal('''
<navPoint id="navPoint-1" playOrder="1">
  <navLabel>
      <text>HTML</text>
  </navLabel>
  <content src="htmlexample.html"></content>
</navPoint>''')
    describe '#addToZip',
      () ->
        it 'Returns a promise to add the chapter to zip (test.zip)',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/test.zip')
            zip.pipe(out)
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].addToZip(zip).then(() ->
              zip.finalize((written) ->
                written.should.equal(517)
                done()))
testassets = {}
describe 'EpubAssets',
  () ->
    beforeEach (done) ->
      testassets = new index.Assets('test/files/', 'assets/')
      testassets.init().then(() -> done())
    describe '#addTypeToZip',
      () ->
        it 'Adds all assets of a type to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/js.zip')
            zip.pipe(out)
            testassets.addTypeToZip('js', zip).then(() ->
              zip.finalize((written) ->
                written.should.equal(62918)
                done()))
    describe '#addToZip',
      () ->
        it 'Adds all assets to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/assets.zip')
            zip.pipe(out)
            testassets.addToZip(zip).then(() ->
              zip.finalize((written) ->
                written.should.equal(386001)
                done()))
    describe '#mangleFonts',
      () ->
        it 'Adds all assets to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/mangledfonts.zip')
            zip.pipe(out)
            testassets.mangleFonts(zip, "4FD972A1-EFA8-484F-9AB3-878E817AF30D").then(() ->
              zip.finalize((written) ->
                written.should.equal(124664)
                done()))


describe 'EpubBook',
  () ->
    beforeEach (done) ->
      assets = new Assets("test/files/", "assets/")
      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        bookId: "this-is-an-id"
        lang: "en"
        cover: "assets/cover.jpg"
        description: 'foo'
        publisher: 'Bar'
        subject1: 'Foobar'
        version: "1.0"
        date: "15 May 2013"
        copyrightYear: "19watsit"
        }, assets)
      for chap in testchapters
        testbook.addChapter(new Chapter(chap))
      testbook.assets.init().then(() ->
        done())
    describe '#epubManifest',
      () ->
        it 'Renders the manifest xml for epub',
          () ->
            testbook.epubManifest.should.equal("<item id=\"doc1\" href=\"chapters/doc1.html\" media-type=\"application/xhtml+xml\" properties=\"\"/>\n<item id=\"htmlexample\" href=\"htmlexample.html\" media-type=\"application/xhtml+xml\" properties=\"\"/>\n<item id=\"doc2\" href=\"chapters/doc2.html\" media-type=\"application/xhtml+xml\" properties=\"\"/>\n<item id=\"doc3\" href=\"chapters/doc3.html\" media-type=\"application/xhtml+xml\" properties=\"\"/>\n")
    describe '#epubSpine',
      () ->
        it 'Renders the spine xml for epub',
          () ->
            testbook.epubSpine.should.equal("<itemref idref=\"doc1\" linear=\"yes\"></itemref>\n<itemref idref=\"htmlexample\" linear=\"yes\"></itemref>\n<itemref idref=\"doc2\" linear=\"yes\"></itemref>\n<itemref idref=\"doc3\" linear=\"yes\"></itemref>\n")
    describe '#navList',
      () ->
        it 'Renders the nav li html for epub',
          () ->
            testbook.navList.should.equal("<li class=\"tocitem doc1\" id=\"toc-doc1\"><a href=\"chapters/doc1.html\">Markdown</a>\n</li>\n<li class=\"tocitem htmlexample\" id=\"toc-htmlexample\"><a href=\"htmlexample.html\">HTML</a>\n</li>\n<li class=\"tocitem doc2\" id=\"toc-doc2\"><a href=\"chapters/doc2.html\">XHTML</a>\n</li>\n<li class=\"tocitem doc3\" id=\"toc-doc3\"><a href=\"chapters/doc3.html\">Template</a>\n</li>\n")
    describe '#epubNCX',
      () ->
        it 'Renders the ncx xml for epub',
          () ->
            testbook.epubNCX.should.equal("<navPoint id=\"navPoint-1\" playOrder=\"1\">\n  <navLabel>\n      <text>Markdown</text>\n  </navLabel>\n  <content src=\"chapters/doc1.html\"></content>\n</navPoint><navPoint id=\"navPoint-2\" playOrder=\"2\">\n  <navLabel>\n      <text>HTML</text>\n  </navLabel>\n  <content src=\"htmlexample.html\"></content>\n</navPoint><navPoint id=\"navPoint-3\" playOrder=\"3\">\n  <navLabel>\n      <text>XHTML</text>\n  </navLabel>\n  <content src=\"chapters/doc2.html\"></content>\n</navPoint><navPoint id=\"navPoint-4\" playOrder=\"4\">\n  <navLabel>\n      <text>Template</text>\n  </navLabel>\n  <content src=\"chapters/doc3.html\"></content>\n</navPoint>")
    describe '#addChaptersToZip',
      () ->
        it 'Adds all chapters to zip (chapters.zip)',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/chapters.zip')
            zip.pipe(out)
            testbook.addChaptersToZip(zip).then(() ->
              zip.finalize((written) ->
                written.should.equal(1930)
                done()))
    describe '#toEpub',
      () ->
        it 'Renders the book to epub',
          (done) ->
            out = fs.createWriteStream('test/files/test.epub')
            testbook.toEpub(out).then((thing) ->
              console.log(thing)
              done()
            , undefined, (notice) -> console.log notice)


