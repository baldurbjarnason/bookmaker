'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
SubOutline = index.SubOutline

testbook = {}
testchapters =  {
  'md': {
    type: 'md',
    title: 'Markdown',
    body: '# header\n\nTest'
  },
  'html': {
    type: 'html',
    title: 'HTML',
    arbitraryMeta: 'is arbitrary'
    body: '<h1>header</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  },
  'xhtml': {
    type: 'xhtml',
    title: 'XHTML',
    body: '<h1>header</h1><p>Test<br/></p>'
  },
  'hbs': {
    type: 'hbs',
    title: 'Template',
    body: '<h1>{{title}}</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  }
}

describe 'Chapter',
  () ->
    describe '#constructor',
      () ->
        it 'should contain all of the properties of the passed object',
          () ->
            testchapter = new Chapter(testchapters.html)
            testchapter.title.should.equal('HTML')
            testchapter.arbitraryMeta.should.equal('is arbitrary')
    describe '#context',
      () ->
        it 'should contain all of the context needed for templates',
          () ->
            testbook = new Book({
              title: 'The Wonderful Wizard of Oz',
              author: 'L. Frank Baum',
              sharedAssetsPath: 'sharedassets/',
              sharedAssetsRoot: '../' })
            testbook.addChapter(new Chapter(testchapters.html))
            testbook.chapters.should.be.instanceOf(Array)
            testbook.chapters[0].title.should.equal('HTML')
            testbook.chapters[0].arbitraryMeta.should.equal('is arbitrary')
            testbook.chapters[0].should.be.instanceOf(Chapter)
            context = testbook.chapters[0].context()
            context.should.have.property('meta', testbook.meta)
            context.should.have.property('chapters', testbook.chapters)
            context.should.have.property('assets', testbook.assets)
            context.should.have.property('title', 'HTML')
            context.should.have.property('arbitraryMeta', 'is arbitrary')
    describe '#html (html)',
      () ->
        it 'should correctly render xhtml body content',
          () ->
            testchapter = new Chapter(testchapters.html)
            testchapter.title.should.equal('HTML')
            testchapter.arbitraryMeta.should.equal('is arbitrary')
            testchapter.should.be.instanceOf(Chapter)
            testchapter.html.should.equal('<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>')
    describe '#html (md)',
      () ->
        it 'should correctly render xhtml body content',
          () ->
            testchapter = new Chapter(testchapters.md)
            testchapter.title.should.equal('Markdown')
            testchapter.should.be.instanceOf(Chapter)
            testchapter.html.should.equal('<h1 id="h1-1">header</h1>\n\n<p class="noindent" id="p-1">Test</p>\n')
    describe '#html (hbs)',
      () ->
        it 'should correctly render xhtml body content',
          () ->
            testbook = new Book({
              title: 'The Wonderful Wizard of Oz',
              author: 'L. Frank Baum',
              sharedAssetsPath: 'sharedassets/',
              sharedAssetsRoot: '../' })
            testbook.addChapter(new Chapter(testchapters.hbs))
            testbook.chapters[0].should.be.instanceOf(Chapter)
            testbook.chapters[0].title.should.equal('Template')
            testbook.chapters[0].should.be.instanceOf(Chapter)
            testbook.chapters[0].html.should.equal('<h1 id="h1-1">Template</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>')
    describe '#html (xhtml)',
      () ->
        it 'should correctly render xhtml body content',
          () ->
            testchapter = new Chapter(testchapters.xhtml)
            testchapter.title.should.equal('XHTML')
            testchapter.should.be.instanceOf(Chapter)
            testchapter.html.should.equal('<h1>header</h1><p>Test<br/></p>')
    describe '#htmlPromise (html)',
      () ->
        it 'should correctly render xhtml body content',
          (done) ->
            testchapter = new Chapter(testchapters.html)
            testchapter.title.should.equal('HTML')
            testchapter.arbitraryMeta.should.equal('is arbitrary')
            testchapter.should.be.instanceOf(Chapter)
            testchapter.htmlPromise().then(
              (html) ->
                html.should.equal('<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>')
                done())


