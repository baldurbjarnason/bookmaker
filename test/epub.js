'use strict';
var Book, Chapter, SubOutline, callbacks, chai, fs, index, should, testassets, testbook, testchapters, testoutline, whenjs, zipStream;

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

testassets = {};

describe('EpubAssets', function() {
  beforeEach(function() {
    return testassets = new index.Assets('test/files/', 'assets/');
  });
  describe('#addTypeToZip', function() {
    return it('Adds all assets of a type to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/js.zip');
      zip.pipe(out);
      return testassets.addTypeToZip('js', zip).then(function() {
        return zip.finalize(function(written) {
          written.should.equal(62918);
          return done();
        });
      });
    });
  });
  describe('#addToZip', function() {
    return it('Adds all assets to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/assets.zip');
      zip.pipe(out);
      return testassets.addToZip(zip).then(function() {
        return zip.finalize(function(written) {
          written.should.equal(335230);
          return done();
        });
      });
    });
  });
  return describe('#mangleFonts', function() {
    return it('Adds all assets to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/mangledfonts.zip');
      zip.pipe(out);
      return testassets.mangleFonts(zip, "4FD972A1-EFA8-484F-9AB3-878E817AF30D").then(function() {
        return zip.finalize(function(written) {
          written.should.equal(124664);
          return done();
        });
      });
    });
  });
});

describe('EpubBook', function() {
  before(function() {
    var chap, _i, _len, _results;

    testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      sharedAssetsFolder: 'sharedassets/',
      sharedAssetsRoot: '../'
    });
    _results = [];
    for (_i = 0, _len = testchapters.length; _i < _len; _i++) {
      chap = testchapters[_i];
      _results.push(testbook.addChapter(new Chapter(chap)));
    }
    return _results;
  });
  describe('#epubManifest', function() {
    return it('Renders the manifest xml for epub', function() {
      return testbook.epubManifest.should.equal("<item id=\"doc1\" href=\"chapters/doc1.html\" media-type=\"application/xhtml+xml\"/>\n<item id=\"htmlexample\" href=\"htmlexample.html\" media-type=\"application/xhtml+xml\"/>\n<item id=\"doc2\" href=\"chapters/doc2.html\" media-type=\"application/xhtml+xml\"/>\n<item id=\"doc3\" href=\"chapters/doc3.html\" media-type=\"application/xhtml+xml\"/>\n");
    });
  });
  describe('#epubSpine', function() {
    return it('Renders the spine xml for epub', function() {
      return testbook.epubSpine.should.equal("<itemref idref=\"doc1\" linear=\"yes\"></itemref>\n<itemref idref=\"htmlexample\" linear=\"yes\"></itemref>\n<itemref idref=\"doc2\" linear=\"yes\"></itemref>\n<itemref idref=\"doc3\" linear=\"yes\"></itemref>\n");
    });
  });
  describe('#navList', function() {
    return it('Renders the nav li html for epub', function() {
      return testbook.navList.should.equal("<li class=\"tocitem doc1\" id=\"toc-doc1\"><a href=\"chapters/doc1.html\">Markdown</a>\n</li>\n<li class=\"tocitem htmlexample\" id=\"toc-htmlexample\"><a href=\"htmlexample.html\">HTML</a>\n</li>\n<li class=\"tocitem doc2\" id=\"toc-doc2\"><a href=\"chapters/doc2.html\">XHTML</a>\n</li>\n<li class=\"tocitem doc3\" id=\"toc-doc3\"><a href=\"chapters/doc3.html\">Template</a>\n</li>\n");
    });
  });
  describe('#epubNCX', function() {
    return it('Renders the ncx xml for epub', function() {
      return testbook.epubNCX.should.equal("<navPoint id=\"navPoint-2\" playOrder=\"2\">\n  <navLabel>\n      <text>Markdown</text>\n  </navLabel>\n  <content src=\"chapters/doc1.html\"></content>\n</navPoint><navPoint id=\"navPoint-3\" playOrder=\"3\">\n  <navLabel>\n      <text>HTML</text>\n  </navLabel>\n  <content src=\"htmlexample.html\"></content>\n</navPoint><navPoint id=\"navPoint-4\" playOrder=\"4\">\n  <navLabel>\n      <text>XHTML</text>\n  </navLabel>\n  <content src=\"chapters/doc2.html\"></content>\n</navPoint><navPoint id=\"navPoint-5\" playOrder=\"5\">\n  <navLabel>\n      <text>Template</text>\n  </navLabel>\n  <content src=\"chapters/doc3.html\"></content>\n</navPoint>");
    });
  });
  return describe('#addChaptersToZip', function() {
    return it('Adds all chapters to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/chapters.zip');
      zip.pipe(out);
      return testbook.addChaptersToZip(zip).then(function() {
        return zip.finalize(function(written) {
          written.should.equal(1533);
          return done();
        });
      });
    });
  });
});
