'use strict';
var Book, Chapter, SubOutline, chai, index, should, testbook, testchapters, testoutline;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Chapter = index.Chapter;

Book = index.Book;

SubOutline = index.SubOutline;

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

describe('SubOutline', function() {
  beforeEach(function() {
    return testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      sharedAssetsPath: 'sharedassets/',
      sharedAssetsRoot: '../'
    });
  });
  describe('#constructor', function() {
    return it('should provide access to all subChapters', function() {
      testbook.addChapter(new Chapter(testoutline));
      testbook.chapters[0].should.have.property('subChapters');
      testbook.chapters[0].subChapters.should.have.property('book', testbook);
      testbook.chapters[0].subChapters.should.have.property('chapters');
      testbook.chapters[0].subChapters.chapters.should.be.instanceOf(Array);
      return testbook.chapters[0].subChapters.chapters.should.have.length(4);
    });
  });
  return describe('#docId', function() {
    return it('should equal doc1, doc2, doc3, doc4', function() {
      testbook.docId().should.equal('doc1');
      testbook.docId().should.equal('doc2');
      testbook.docId().should.equal('doc3');
      testbook.addChapter(testoutline);
      return testbook.docId().should.equal('doc4');
    });
  });
});
