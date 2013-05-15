'use strict';
var Book, Chapter, SubOutline, callbacks, chai, fs, index, should, testbook, testchapters, testoutline, whenjs, zipStream;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Chapter = index.Chapter;

Book = index.Book;

SubOutline = index.SubOutline;

zipStream = require('zipstream-contentment');

fs = require('fs');

whenjs = require('when');

callbacks = require('when/callbacks');

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

testbook = {};

testchapters = [
  {
    type: 'md',
    title: 'Markdown',
    body: '# header\n\nTest'
  }, {
    type: 'html',
    id: 'htmlexample',
    filename: 'htmlexample.html',
    title: 'HTML',
    arbitraryMeta: 'is arbitrary',
    body: '<h1>header</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  }, {
    type: 'xhtml',
    title: 'XHTML',
    body: '<h1>header</h1><p>Test<br/></p>'
  }, {
    type: 'hbs',
    title: 'Template',
    body: '<h1>{{title}}</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  }
];

describe('EpubChapter', function() {
  beforeEach(function() {
    return testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      sharedAssetsFolder: 'sharedassets/',
      sharedAssetsRoot: '../'
    });
  });
  describe('#epubManifest', function() {
    return it('generates the xml manifest for epub', function() {
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].epubManifest.should.equal('<item id="htmlexample" href="htmlexample.html" media-type="application/xhtml+xml"/>\n');
    });
  });
  describe('#epubSpine', function() {
    return it('generates the xml spine for epub', function() {
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].epubSpine.should.equal('<itemref idref="htmlexample" linear="yes"></itemref>\n');
    });
  });
  describe('#navList', function() {
    return it('generates the html nav li entry for epub', function() {
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].navList.should.equal('<li class="tocitem htmlexample" id="toc-htmlexample"><a href="htmlexample.html">HTML</a>\n</li>\n');
    });
  });
  describe('#epubNCX', function() {
    return it('generates the xml NCX entry for epub', function() {
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].epubNCX.should.equal('<navPoint id="navPoint-2" playOrder="2">\n  <navLabel>\n      <text>HTML</text>\n  </navLabel>\n  <content src="htmlexample.html"></content>\n</navPoint>');
    });
  });
  return describe('#addToZip', function() {
    return it('Returns a promise to add the chapter to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/test.zip');
      zip.pipe(out);
      zip.add = callbacks.promisify(zip.addFile, {
        callback: -1
      });
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].addToZip(zip).then(function() {
        return zip.finalize(function(written) {
          written.should.equal(417);
          return done();
        });
      });
    });
  });
});
