'use strict';
var Book, chai, index, should;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Book = index.Book;

describe('BookDir', function() {
  return describe('#loadBookDir', function() {
    return it('Loads the book from a bookdir', function() {
      var book;

      book = Book.loadBookDir('test/files/bookdir/');
      book.meta.title.should.equal('The Wonderful Wizard of Oz');
      book.meta.author.should.equal('L. Frank Baum');
      book.meta.bookId.should.equal("this-is-an-id");
      book.meta.lang.should.equal('en');
      book.meta.modified.isoDate.should.equal("2013-05-18T23:00:00Z");
      book.meta.date.isoDate.should.equal("2013-05-14T23:00:00Z");
      book.meta.version.should.equal("1.0");
      book.meta.publisher.should.equal("Bar");
      book.meta.subject1.should.equal("Foobar");
      book.meta.cover.should.equal("assets/cover.jpg");
      book.chapters[0].title.should.equal('HTML');
      book.chapters[0].arbitraryMeta.should.equal('is arbitrary');
      book.chapters[0].html.should.equal('\n\n<h1 id="h1-1">header</h1><p class="noindent" id="p-1">Test<br />‘—’“–”&#160;</p>\n');
      book.chapters[1].title.should.equal('Markdown');
      book.chapters[1].html.should.equal('<h1 id="h1-1">Markdown</h1>\n<p class="noindent" id="p-1">Test</p>\n');
      book.chapters[2].title.should.equal('XHTML');
      book.chapters[2].html.should.equal('\n\n<h1>header</h1>\n\n<p>Test<br/></p>');
      book.chapters[3].title.should.equal('Template');
      book.chapters[3].html.should.equal('\n\n<h1 id=\"h1-1\">Template</h1>\n\n<p class=\"noindent\" id=\"p-1\">Test<br />‘—’“–”&#160;</p>');
      book.chapters[4].title.should.equal('1');
      book.chapters[4].html.should.equal('<h1 id="h1-1">1</h1>\n<p class="noindent" id="p-1">Test</p>\n');
      book.assets.root.should.equal('test/files/bookdir/');
      book.assets.assetsPath.should.equal('assets/');
      return book.meta.landmarks[0].type.should.equal('bodymatter');
    });
  });
});
