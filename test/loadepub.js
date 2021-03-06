'use strict';
var Book, chai, index, should, testbook;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Book = index.Book;

testbook = {};

describe('EpubLoader', function() {
  beforeEach(function(done) {
    var book, load;
    load = function(err, book) {
      testbook = book;
      return done();
    };
    return book = Book.fromEpub('test/files/test.epub', 'test/files/epubloader/', load);
  });
  return describe('#loadEpub', function() {
    return it('Loads the book from an epub', function() {
      var book;
      book = testbook;
      book.meta.title.should.equal('The Wonderful Wizard of Oz');
      book.meta.author.should.equal('L. Frank Baum');
      book.meta.bookId.should.equal('this-is-an-id');
      book.meta.lang.should.equal('en');
      book.meta.date.isoDate.should.equal("2013-05-15T00:00:00Z");
      book.meta.version.should.equal("1.0");
      book.meta.publisher.should.equal("Bar");
      book.meta.subject1.should.equal("Foobar");
      book.meta.cover.should.equal("assets/cover.jpg");
      book.chapters[0].title.should.equal('Markdown');
      book.chapters[0].body.should.equal('\n\t\n\t\t<h1 id="header">header</h1>\n<p>Test</p>\n\n\t\n');
      book.chapters[1].title.should.equal('HTML');
      book.chapters[1].body.should.equal('\n\t\n\t\t<h1>header</h1><p>Test<br/>&#x2018;&#x2014;&#x2019;&#x201C;&#x2013;&#x201D;&#xA0;</p>\n\t\n');
      book.chapters[2].title.should.equal('XHTML');
      book.chapters[2].body.should.equal('\n\t\n\t\t<h1>header</h1><p>Test<br/></p>\n\t\n');
      book.chapters[3].title.should.equal('Template');
      book.chapters[3].body.should.equal('\n\t\n\t\t<h1>Template</h1><p>Test<br/>&#x2018;&#x2014;&#x2019;&#x201C;&#x2013;&#x201D;&#xA0;</p>\n\t\n');
      return book.assets.root.should.equal('test/files/epubloader');
    });
  });
});
