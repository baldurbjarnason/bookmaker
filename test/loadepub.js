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
      book.chapters[0].title.should.equal('Markdown – The Wonderful Wizard of Oz');
      book.chapters[0].body.should.equal('\n\t\n\t\t<div class=\"bm-chapter\"><h1 id="h1-1">header</h1>\n<p class="noindent" id="p-1">Test</p>\n</div>\n\t\n');
      book.chapters[1].title.should.equal('HTML – The Wonderful Wizard of Oz');
      book.chapters[1].body.should.equal('\n\t\n\t\t<div class=\"bm-chapter\"><h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p></div>\n\t\n');
      book.chapters[2].title.should.equal('XHTML – The Wonderful Wizard of Oz');
      book.chapters[2].body.should.equal('\n\t\n\t\t<div class=\"bm-chapter\"><h1>header</h1><p>Test<br/></p></div>\n\t\n');
      book.chapters[3].title.should.equal('Template – The Wonderful Wizard of Oz');
      book.chapters[3].body.should.equal('\n\t\n\t\t<div class=\"bm-chapter\"><h1 id="h1-1">Template</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p></div>\n\t\n');
      return book.assets.root.should.equal('test/files/epubloader');
    });
  });
});
