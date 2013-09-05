'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Book = index.Book

testbook = {}

describe 'EpubLoader',
  () ->
    beforeEach (done) ->
      load = (err, book) ->
        testbook = book
        done()
      book = Book.fromEpub('test/files/test.epub', 'test/files/epubloader/', load)
    describe '#loadEpub',
      () ->
        it 'Loads the book from an epub',
          () ->
            book = testbook
            # console.log book
            book.meta.title.should.equal('The Wonderful Wizard of Oz')
            book.meta.author.should.equal('L. Frank Baum')
            book.meta.bookId.should.equal('this-is-an-id')
            book.meta.lang.should.equal('en')
            # book.meta.modified.isoDate.should.equal("2013-06-27T01:29:06Z")
            book.meta.date.isoDate.should.equal("2013-05-15T00:00:00Z")
            book.meta.version.should.equal("1.0")
            book.meta.publisher.should.equal("Bar")
            book.meta.subject1.should.equal("Foobar")
            book.meta.cover.should.equal("assets/cover.jpg")
            book.chapters[0].title.should.equal('Markdown – The Wonderful Wizard of Oz')
            book.chapters[0].body.should.equal('\n\t\n\t\t<h1 id="h1-1">header</h1>\n<p class="noindent" id="p-1">Test</p>\n\n\t\n')
            book.chapters[1].title.should.equal('HTML – The Wonderful Wizard of Oz')
            book.chapters[1].body.should.equal('\n\t\n\t\t<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>\n\t\n')
            book.chapters[2].title.should.equal('XHTML – The Wonderful Wizard of Oz')
            book.chapters[2].body.should.equal('\n\t\n\t\t<h1>header</h1><p>Test<br/></p>\n\t\n')
            book.chapters[3].title.should.equal('Template – The Wonderful Wizard of Oz')
            book.chapters[3].body.should.equal('\n\t\n\t\t<h1 id="h1-1">Template</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>\n\t\n')
            book.assets.root.should.equal('test/files/epubloader')