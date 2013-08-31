'use strict';
var Assets, Book, Chapter, chai, exec, fs, index, should, testassets, testbook, testchapters, testoutline, zipStream;

chai = require('chai');

should = chai.should();

index = require('../src/index');

Chapter = index.Chapter;

Book = index.Book;

Assets = index.Assets;

zipStream = require('zipstream-contentment');

fs = require('fs');

exec = require('child_process').exec;

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
  beforeEach(function(done) {
    var assets;

    assets = new Assets("test/files/", "assets/");
    testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum'
    }, assets);
    return testbook.assets.init(done);
  });
  return describe('#addToZip', function() {
    return it('Returns a promise to add the chapter to zip (test.zip)', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/test.zip');
      zip.pipe(out);
      testbook.addChapter(new Chapter(testchapters[1]));
      return testbook.chapters[0].addToZip(zip, null, function() {
        return zip.finalize(function(written) {
          written.should.equal(576);
          return done();
        });
      });
    });
  });
});

testassets = {};

describe('EpubAssets', function() {
  beforeEach(function(done) {
    testassets = new index.Assets('test/files/', 'assets/');
    return testassets.init(done);
  });
  describe('#addTypeToZip', function() {
    return it('Adds all assets of a type to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/js.zip');
      zip.pipe(out);
      return testassets.addTypeToZip('js', zip, function() {
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
      return testassets.addToZip(zip, function() {
        return zip.finalize(function(written) {
          written.should.equal(386001);
          return done();
        });
      });
    });
  });
  return describe('#mangleFonts', function() {
    return it('Adds all mangled fonts to zip', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/mangledfonts.zip');
      zip.pipe(out);
      return testassets.mangleFonts(zip, "4FD972A1-EFA8-484F-9AB3-878E817AF30D", function() {
        return zip.finalize(function(written) {
          written.should.equal(124787);
          return done();
        });
      });
    });
  });
});

describe('EpubBook', function() {
  beforeEach(function(done) {
    var assets, chap, _i, _len;

    assets = new Assets("test/files/", "assets/");
    testbook = new Book({
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      bookId: "this-is-an-id",
      lang: "en",
      cover: "assets/cover.jpg",
      description: 'foo',
      publisher: 'Bar',
      subject1: 'Foobar',
      version: "1.0",
      date: "2013-05-15T00:00:00Z",
      copyrightYear: "19watsit"
    }, assets);
    for (_i = 0, _len = testchapters.length; _i < _len; _i++) {
      chap = testchapters[_i];
      testbook.addChapter(new Chapter(chap));
    }
    testbook.meta.start = testbook.chapters[1];
    return testbook.assets.init(done);
  });
  describe('#addChaptersToZip', function() {
    return it('Adds all chapters to zip (chapters.zip)', function(done) {
      var out, zip;

      zip = zipStream.createZip({
        level: 1
      });
      out = fs.createWriteStream('test/files/chapters.zip');
      zip.pipe(out);
      return testbook.addChaptersToZip(zip, null, function() {
        return zip.finalize(function(written) {
          written.should.equal(2289);
          return done();
        });
      });
    });
  });
  return describe('#toEpub', function() {
    return it('Renders the book to epub', function(done) {
      var out;

      this.timeout(10000);
      out = fs.createWriteStream('test/files/test.epub');
      return testbook.toEpub(out, null, function(err, thing) {
        var checkReport,
          _this = this;

        if (err) {
          done(err);
        }
        console.log(thing);
        checkReport = function(error, stdout, stderr) {
          if (error) {
            done(error);
          }
          if (stderr) {
            done(stderr);
          }
          if (stdout) {
            console.log(stdout);
            return done();
          }
        };
        return exec('epubcheck test/files/test.epub', checkReport);
      }, void 0, function(notice) {
        return console.log(notice);
      });
    });
  });
});
