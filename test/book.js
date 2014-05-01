'use strict';
var Book, Chapter, chai, index, should, testbook, testchapters, testoutline;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Chapter = index.Chapter;

Book = index.Book;

testbook = {};

testchapters = {
  'toc': {
    id: 'nav',
    filename: 'index.html',
    render: false,
    title: 'Table of Contents',
    nomanifest: true,
    majornavitem: true,
    toc: true
  },
  'title': {
    id: 'titlepage',
    filename: 'title.html',
    title: 'Title Page',
    render: true,
    template: 'title.hbs',
    majornavitem: true
  },
  'titletoc': {
    id: 'titletoc',
    filename: 'title.html',
    title: 'Contents',
    render: true,
    template: 'titletoc.hbs',
    majornavitem: true,
    toc: true
  },
  'chapter1': {
    type: 'md',
    body: '# This is Markdown!'
  }
};

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
    }, {
      id: 'titlepage',
      filename: 'title.html',
      title: 'Title Page',
      render: true,
      template: 'title.hbs',
      majornavitem: true
    }, {
      id: 'titletoc',
      filename: 'title.html',
      title: 'Contents',
      render: true,
      template: 'titletoc.hbs',
      majornavitem: true,
      toc: true
    }, {
      type: 'md',
      body: '# This is Markdown!'
    }
  ]
};

describe('Book', function() {
  beforeEach(function() {
    return testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum'
    });
  });
  describe('#meta', function() {
    return it('should contain all of the properties of the passed meta object', function() {
      testbook.meta.should.have.property('title', 'The Wonderful Wizard of Oz');
      return testbook.meta.should.have.property('author', 'L. Frank Baum');
    });
  });
  describe('#docId', function() {
    return it('should equal doc1, doc2, and doc3', function() {
      testbook.docId().should.equal('doc1');
      testbook.docId().should.equal('doc2');
      return testbook.docId().should.equal('doc3');
    });
  });
  return describe('#addChapter', function() {
    return it('should generate the appropriate properties but no more', function() {
      var testchapter;
      testchapter = new Chapter(testchapters.chapter1);
      testbook.addChapter(testchapter);
      testbook.chapters[0].should.have.property('body', '# This is Markdown!');
      testbook.chapters[0].should.have.property('type', 'md');
      testbook.chapters[0].should.have.property('id', 'doc1');
      testbook.chapters[0].should.have.property('filename', 'chapters/doc1.html');
      return testbook.chapters[0].should.not.have.property('title');
    });
  });
});
