'use strict';
var book, chai, should, testbook, testchapters, testoutline;

chai = require('chai');

should = chai.should();

book = require('../src/book');

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
    return testbook = new book.Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      sharedAssetsFolder: 'sharedassets/',
      sharedAssetsRoot: '../'
    });
  });
  describe('#meta', function() {
    return it('should contain all of the properties of the passed meta object', function() {
      testbook.meta.should.have.property('title', 'The Wonderful Wizard of Oz');
      return testbook.meta.should.have.property('author', 'L. Frank Baum');
    });
  });
  describe('#root', function() {
    return it('should equal the current working directory', function() {
      return testbook.should.have.property('root', process.cwd());
    });
  });
  describe('#assetsFolder', function() {
    return it('should be assets/', function() {
      return testbook.should.have.property('assetsFolder', 'assets/');
    });
  });
  describe('#sharedAssets', function() {
    return it('should be sharedassets/ and ../', function() {
      testbook.sharedAssets.should.have.property('assetFolder', 'sharedassets/');
      return testbook.sharedAssets.should.have.property('root', '../');
    });
  });
  describe('#docId', function() {
    return it('should equal doc1, doc2, and doc3', function() {
      testbook.docId().should.equal('doc1');
      testbook.docId().should.equal('doc2');
      return testbook.docId().should.equal('doc3');
    });
  });
  describe('#addChapter', function() {
    return it('should generate the appropriate properties but no more', function() {
      testbook.addChapter(testchapters.chapter1);
      testbook.chapters[0].should.have.property('body', '# This is Markdown!');
      testbook.chapters[0].should.have.property('type', 'md');
      testbook.chapters[0].should.have.property('id', 'doc1');
      testbook.chapters[0].should.have.property('filename', 'chapters/doc1.html');
      return testbook.chapters[0].should.not.have.property('title');
    });
  });
  return describe('#context', function() {
    return it('should provide all necessary context for templates', function() {
      var chapter, _i, _len;

      for (_i = 0, _len = testchapters.length; _i < _len; _i++) {
        chapter = testchapters[_i];
        testbook.addChapter(chapter);
      }
      testbook.context().should.have.property('meta', testbook.meta);
      testbook.context().should.have.property('assets', testbook.assets);
      return testbook.context().should.have.property('chapters', testbook.chapters);
    });
  });
});

describe('SubOutline', function() {
  beforeEach(function() {
    return testbook = new book.Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      sharedAssetsFolder: 'sharedassets/',
      sharedAssetsRoot: '../'
    });
  });
  return describe('#constructor', function() {
    return it('should provide access to all subChapters', function() {
      testbook.addChapter(testoutline);
      console.log(testbook.chapters[0].subChapters.chapters);
      testbook.chapters[0].should.have.property('subChapters');
      testbook.chapters[0].subChapters.should.have.property('book', testbook);
      testbook.chapters[0].subChapters.should.have.property('chapters');
      testbook.chapters[0].subChapters.chapters.should.be.instanceOf(Array);
      return testbook.chapters[0].subChapters.chapters.should.have.length(4);
    });
  });
});
