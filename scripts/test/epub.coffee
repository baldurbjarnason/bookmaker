'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
Assets = index.Assets
zipStream = require('zipstream-contentment')
fs = require 'fs'
exec = require('child_process').exec

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
      testbook.assets.init(done)
    describe '#addToZip',
      () ->
        it 'Returns a promise to add the chapter to zip (test.zip)',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/test.zip')
            zip.pipe(out)
            testbook.addChapter(new Chapter(testchapters[1]))
            testbook.chapters[0].addToZip(zip, null, () ->
              zip.finalize((written) ->
                written.should.equal(573)
                done()))
testassets = {}
describe 'EpubAssets',
  () ->
    beforeEach (done) ->
      testassets = new index.Assets('test/files/', 'assets/')
      testassets.init(done)
    describe '#addTypeToZip',
      () ->
        it 'Adds all assets of a type to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/js.zip')
            zip.pipe(out)
            testassets.addTypeToZip('js', zip, () ->
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
            testassets.addToZip(zip, () ->
              zip.finalize((written) ->
                written.should.equal(386001)
                done()))
    describe '#mangleFonts',
      () ->
        it 'Adds all mangled fonts to zip',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/mangledfonts.zip')
            zip.pipe(out)
            testassets.mangleFonts(zip, "4FD972A1-EFA8-484F-9AB3-878E817AF30D", () ->
              zip.finalize((written) ->
                written.should.equal(124787)
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
        date: "2013-05-15T00:00:00Z"
        copyrightYear: "19watsit"
        }, assets)
      for chap in testchapters
        testbook.addChapter(new Chapter(chap))
      testbook.meta.start = testbook.chapters[1]
      testbook.assets.init(done)
    describe '#addChaptersToZip',
      () ->
        it 'Adds all chapters to zip (chapters.zip)',
          (done) ->
            zip = zipStream.createZip({ level: 1 })
            out = fs.createWriteStream('test/files/chapters.zip')
            zip.pipe(out)
            testbook.addChaptersToZip(zip, null, () ->
              zip.finalize((written) ->
                written.should.equal(2279)
                done()))
    describe '#toEpub',
      () ->
        it 'Renders the book to epub',
          (done) ->
            this.timeout(10000)
            out = fs.createWriteStream('test/files/test.epub')
            testbook.toEpub(out, null, (err, thing) ->
              if err
                done(err)
              console.log thing
              checkReport = (error, stdout, stderr) =>
                if error
                  done error
                if stderr
                  done stderr
                if stdout
                  console.log stdout
                  done()
              exec('epubcheck test/files/test.epub', checkReport)
            , undefined, (notice) -> console.log notice)


