'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
SubOutline = index.SubOutline
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
    beforeEach () ->
      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        sharedAssetsFolder: 'sharedassets/',
        sharedAssetsRoot: '../' })
    describe '#epubManifest',
      () ->
        it 'generates the xml manifest for epub',
          () ->
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].epubManifest.should.equal('<item id="htmlexample" href="htmlexample.html" media-type="application/xhtml+xml"/>\n')
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
<navPoint id="navPoint-2" playOrder="2">
  <navLabel>
      <text>HTML</text>
  </navLabel>
  <content src="htmlexample.html"></content>
</navPoint>''')
    describe '#addToZip',
      () ->
        it 'Returns a promise to add the chapter to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/test.zip')
            zip.pipe(out)
            zip.add = callbacks.promisify(zip.addFile, {
              callback: -1
              })
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].addToZip(zip).then(() ->
              zip.finalize((written) ->
                written.should.equal(417)
                done()))





