'use strict';
var Assets, Book, Chapter, SubOutline, chai, index, should, testbook, testchapters;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Chapter = index.Chapter;

Book = index.Book;

Assets = index.Assets;

SubOutline = index.SubOutline;

testbook = {};

testchapters = {
  'md': {
    type: 'md',
    title: 'Markdown',
    body: '# header\n\nTest'
  },
  'html': {
    type: 'html',
    title: 'HTML',
    arbitraryMeta: 'is arbitrary',
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
};

describe('Chapter', function() {
  describe('#constructor', function() {
    return it('should contain all of the properties of the passed object', function() {
      var testchapter;

      testchapter = new Chapter(testchapters.html);
      testchapter.title.should.equal('HTML');
      return testchapter.arbitraryMeta.should.equal('is arbitrary');
    });
  });
  describe('#context', function() {
    return it('should contain all of the context needed for templates', function() {
      var context;

      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        sharedAssetsPath: 'sharedassets/',
        sharedAssetsRoot: '../'
      }, new Assets('test/files', 'assets/'));
      testbook.addChapter(new Chapter(testchapters.html));
      testbook.chapters.should.be.instanceOf(Array);
      testbook.chapters[0].title.should.equal('HTML');
      testbook.chapters[0].arbitraryMeta.should.equal('is arbitrary');
      testbook.chapters[0].should.be.instanceOf(Chapter);
      context = testbook.chapters[0].context();
      context.should.have.property('meta', testbook.meta);
      context.should.have.property('chapters', testbook.chapters);
      context.should.have.property('assets', testbook.assets);
      context.should.have.property('title', 'HTML');
      return context.should.have.property('arbitraryMeta', 'is arbitrary');
    });
  });
  describe('#html (html)', function() {
    return it('should correctly render xhtml body content', function() {
      var testchapter;

      testchapter = new Chapter(testchapters.html);
      testchapter.title.should.equal('HTML');
      testchapter.arbitraryMeta.should.equal('is arbitrary');
      testchapter.should.be.instanceOf(Chapter);
      return testchapter.html.should.equal('<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>');
    });
  });
  describe('#html (md)', function() {
    return it('should correctly render xhtml body content', function() {
      var testchapter;

      testchapter = new Chapter(testchapters.md);
      testchapter.title.should.equal('Markdown');
      testchapter.should.be.instanceOf(Chapter);
      return testchapter.html.should.equal('<h1 id="h1-1">header</h1>\n\n<p class="noindent" id="p-1">Test</p>\n');
    });
  });
  describe('#html (hbs)', function() {
    return it('should correctly render xhtml body content', function() {
      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        sharedAssetsPath: 'sharedassets/',
        sharedAssetsRoot: '../'
      });
      testbook.addChapter(new Chapter(testchapters.hbs));
      testbook.chapters[0].should.be.instanceOf(Chapter);
      testbook.chapters[0].title.should.equal('Template');
      testbook.chapters[0].should.be.instanceOf(Chapter);
      return testbook.chapters[0].html.should.equal('<h1 id="h1-1">Template</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>');
    });
  });
  describe('#html (xhtml)', function() {
    return it('should correctly render xhtml body content', function() {
      var testchapter;

      testchapter = new Chapter(testchapters.xhtml);
      testchapter.title.should.equal('XHTML');
      testchapter.should.be.instanceOf(Chapter);
      return testchapter.html.should.equal('<h1>header</h1><p>Test<br/></p>');
    });
  });
  describe('#toJSON', function() {
    return it('should correctly give you a safe json file', function() {
      var jsontest;

      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        sharedAssetsPath: 'sharedassets/',
        sharedAssetsRoot: '../'
      });
      testbook.addChapter(new Chapter(testchapters.hbs));
      jsontest = testbook.chapters[0].toJSON();
      return jsontest.should.equal("{\n  \"type\": \"html\",\n  \"title\": \"Template\",\n  \"body\": \"<h1 id=\\\"h1-1\\\">Template</h1><p class=\\\"noindent\\\" id=\\\"p-1\\\">Test<br />‘—’“–”&#160;</p>\",\n  \"id\": \"doc1\",\n  \"_links\": {\n    \"toc\": {\n      \"href\": \"../index.json\",\n      \"name\": \"TOC-JSON\",\n      \"type\": \"application/hal+json\"\n    },\n    \"self\": {\n      \"href\": \"doc1.json\",\n      \"type\": \"application/hal+json\"\n    }\n  }\n}");
    });
  });
  return describe('#htmlPromise (html)', function() {
    return it('should correctly render xhtml body content', function(done) {
      var testchapter;

      testchapter = new Chapter(testchapters.html);
      testchapter.title.should.equal('HTML');
      testchapter.arbitraryMeta.should.equal('is arbitrary');
      testchapter.should.be.instanceOf(Chapter);
      return testchapter.htmlPromise().then(function(html) {
        html.should.equal('<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>');
        return done();
      });
    });
  });
});
