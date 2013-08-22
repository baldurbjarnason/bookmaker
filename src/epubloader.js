'use strict';
var $, EpubLoaderMixin, Zip, bodyre, extend, fs, log, parseString, parser, path, sequence, utilities, whenjs, xml2js;

fs = require('fs');

path = require('path');

utilities = require('./utilities');

Zip = require('adm-zip');

xml2js = require('xml2js');

parser = new xml2js.Parser({
  explicitCharkey: true,
  explicitArray: true
});

parseString = parser.parseString;

$ = require('jquery');

whenjs = require('when');

sequence = require('when/sequence');

log = require('./logger').logger();

bodyre = new RegExp('(<body[^>]*>|</body>)', 'ig');

EpubLoaderMixin = (function() {
  function EpubLoaderMixin() {}

  EpubLoaderMixin.fromEpub = function(epubpath, assetsroot) {
    var Assets, Book, Chapter, createMetaAndSpine, done, epub, extractAssetsAndCreateBook, extractChapters, extractLandmarks, extractOpf, findOpf, opfpath, parseChapter, preBook, processNav, promise;

    epub = new Zip(epubpath);
    Chapter = this.Chapter;
    Book = this;
    Assets = this.Assets;
    preBook = {};
    log.info("Extraction starting");
    findOpf = function(xml) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      log.info("EPUB – Finding opf file");
      parseString(xml, function(err, result) {
        var rootfile;

        if (err) {
          log.error(err);
        }
        rootfile = result.container.rootfiles[0].rootfile[0].$['full-path'];
        log.info("EPUB – Path to opf file is /" + rootfile);
        preBook.opfpath = rootfile;
        preBook.basedir = path.dirname(preBook.opfpath);
        return deferred.resolve(rootfile);
      });
      return promise;
    };
    extractOpf = function(xml) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      parseString(xml, function(err, result) {
        if (err) {
          log.error(err);
        }
        return createMetaAndSpine(result, deferred);
      });
      return promise;
    };
    createMetaAndSpine = function(xml, deferred) {
      var elem, item, landmarks, manifest, meta, metadata, props, reference, references, type, uid, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;

      metadata = xml["package"].metadata[0];
      preBook.meta = meta = {};
      uid = xml["package"].$['unique-identifier'];
      _ref = metadata['dc:identifier'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (elem.$['id'] === uid) {
          meta.bookId = elem._;
        }
      }
      meta.specifiedCss = true;
      meta.specifiedJs = true;
      if (metadata['dc:creator']) {
        meta.author = metadata['dc:creator'][0]._;
      } else {
        log.warn('Author metadata not set (dc:creator)');
      }
      if (metadata['dc:title']) {
        meta.title = metadata['dc:title'][0]._;
      } else {
        log.warn('Title not set (dc:title)');
      }
      if (metadata['dc:creator'][1]) {
        meta.author2 = metadata['dc:creator'][1]._;
      }
      if (meta.lang = metadata['dc:language']) {
        meta.lang = metadata['dc:language'][0]._;
      } else {
        log.warn('Language metadata not set (dc:language)');
      }
      if (metadata['dc:date']) {
        meta.date = metadata['dc:date'][0]._;
      } else {
        log.warn("Date not set (dc:date)");
      }
      if (metadata['dc:rights']) {
        meta.rights = metadata['dc:rights'][0]._;
      } else {
        log.warn("Rights metadata not set (dc:rights)");
      }
      if (metadata['dc:description']) {
        meta.description = metadata['dc:description'][0]._;
      } else {
        log.warn("Description metadata not set (dc:description)");
      }
      if (metadata['dc:publisher']) {
        meta.publisher = metadata['dc:publisher'][0]._;
      } else {
        log.warn("Publisher metadata not set (dc:publisher)");
      }
      if (metadata['dc:subject']) {
        meta.subject1 = metadata['dc:subject'][0]._;
      } else {
        log.warn('Subject not set (dc:subject)');
      }
      if (metadata['dc:subject'] && metadata['dc:subject'][1]) {
        meta.subject2 = metadata['dc:subject'][1]._;
      }
      if (metadata['dc:subject'] && metadata['dc:subject'][2]) {
        meta.subject3 = metadata['dc:subject'][2]._;
      }
      _ref1 = metadata.meta;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        elem = _ref1[_j];
        if (elem.$['property'] === "dcterms:modified") {
          meta.modified = elem._;
        }
        if (elem.$['name'] === 'cover') {
          preBook.coverId = elem.$['content'];
        }
        if (elem.$['property'] === 'ibooks:version') {
          meta.version = elem._;
        }
      }
      manifest = xml["package"].manifest[0];
      log.info('EPUB – Extracting metadata');
      preBook.spine = (function() {
        var _k, _len2, _ref2, _results;

        _ref2 = xml["package"].spine[0].itemref;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          item = _ref2[_k];
          _results.push(item.$.idref);
        }
        return _results;
      })();
      _ref2 = manifest.item;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        elem = _ref2[_k];
        if (preBook.spine.indexOf(elem.$.id) !== -1) {
          preBook.spine[preBook.spine.indexOf(elem.$.id)] = elem.$.href;
        }
        if (elem.$.id === preBook.coverId) {
          meta.cover = elem.$.href;
        }
        if (elem.$.properties) {
          props = elem.$.properties.split(' ');
          if (props.indexOf('cover-image') !== -1) {
            meta.cover = elem.$.href;
          }
          if (props.indexOf('nav') !== -1) {
            preBook.navPath = elem.$.href;
          }
        }
      }
      if (xml["package"].guide) {
        references = xml["package"].guide[0].reference;
        landmarks = [];
        for (_l = 0, _len3 = references.length; _l < _len3; _l++) {
          reference = references[_l];
          if (reference.$.type === 'text' || reference.$.type === 'start') {
            type = 'bodymatter';
          } else {
            type = reference.$.type;
          }
          if (reference.$.type === 'cover') {
            preBook.spine = preBook.spine.filter(function(path) {
              if (path !== reference.$.href) {
                return path;
              }
            });
          } else {
            if (preBook.spine.indexOf(reference.$.href) !== -1) {
              landmarks.push({
                type: type,
                title: reference.$.title,
                href: reference.$.href
              });
            } else {
              log.warn("Landmark " + type + " isn't in the spine");
            }
          }
        }
        if (landmarks.length > 0) {
          meta.landmarks = landmarks;
        }
      }
      log.info('EPUB – OPF parsed and worked');
      return deferred.resolve(xml);
    };
    extractLandmarks = function(index, element) {
      var href, title, type;

      type = $(this).attr('epub:type');
      title = $(this).text();
      href = $(this).attr('href');
      if (preBook.spine.indexOf(href) !== -1) {
        return preBook.landmarks.push({
          type: type,
          title: title,
          href: href
        });
      } else {
        return log.warn("Landmark " + type + " isn't in the spine");
      }
    };
    processNav = function(xml) {
      var body, deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      body = xml.split(bodyre)[2];
      $('body').html(body);
      log.info(preBook.meta.landmarks);
      preBook.landmarks = [];
      $('nav[epub\\:type=landmarks] a[epub\\:type]').each(extractLandmarks);
      if (preBook.landmarks.length !== 0) {
        preBook.meta.landmarks = preBook.landmarks;
      }
      log.info(preBook.meta.landmarks);
      preBook.outline = $('nav[epub\\:type=toc]').html();
      deferred.resolve(xml);
      log.info('EPUB – Nav parsed and worked');
      return promise;
    };
    extractAssetsAndCreateBook = function() {
      var assets, assetslist, deferred, entry, promise, _i, _len;

      deferred = whenjs.defer();
      promise = deferred.promise;
      assetslist = epub.getEntries().filter(function(entry) {
        var ext;

        ext = path.extname(entry.entryName);
        if (entry.entryName === 'mimetype') {
          return false;
        }
        switch (ext) {
          case '.html':
            return false;
          case '.xhtml':
            return false;
          case '.opf':
            return false;
          case '.ncx':
            return false;
          case '.xml':
            return false;
          default:
            return true;
        }
      });
      for (_i = 0, _len = assetslist.length; _i < _len; _i++) {
        entry = assetslist[_i];
        log.info("Extracting " + entry.entryName);
        epub.extractEntryTo(entry, assetsroot, true, true);
      }
      if (preBook.basedir) {
        assetsroot = path.join(assetsroot, preBook.basedir);
      }
      assets = new Assets(assetsroot, '.');
      preBook.book = new Book(preBook.meta, assets);
      preBook.book.outline = preBook.outline;
      deferred.resolve(preBook.book);
      log.info('EPUB – assets extracted');
      return promise;
    };
    parseChapter = function(xml, chapterpath) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      chapterpath = unescape(chapterpath);
      parseString(xml, function(err, result) {
        var chapter, css, js, link, links, script, scripts, _i, _j, _len, _len1, _links;

        log.info("EPUB – Parsing " + chapterpath);
        if (err) {
          log.error(err);
        }
        chapter = {};
        chapter.title = result.html.head[0].title[0]._;
        chapter.type = 'xhtml';
        chapter.body = xml.split(bodyre)[2];
        chapter.filename = chapterpath;
        links = result.html.head[0].link;
        css = [];
        _links = {};
        if (links) {
          for (_i = 0, _len = links.length; _i < _len; _i++) {
            link = links[_i];
            if (link.$.type === 'text/css') {
              css.push(link.$.href);
            } else {
              _links[link.$.rel] = {
                type: link.$.type,
                href: link.$.href
              };
              if (link.$.hreflang) {
                _links[link.$.rel].hreflang = link.$.hreflang;
              }
            }
          }
        }
        chapter.css = css;
        scripts = result.html.head[0].scripts;
        js = [];
        if (scripts) {
          for (_j = 0, _len1 = scripts.length; _j < _len1; _j++) {
            script = scripts[_j];
            js.push(script.$.src);
          }
        }
        preBook.book.addChapter(new Chapter(chapter));
        return deferred.resolve(chapter);
      });
      return promise;
    };
    extractChapters = function(book) {
      var chapter, chapterpath, chapters, deferred, promise, xml, _i, _len, _ref;

      deferred = whenjs.defer();
      promise = deferred.promise;
      chapters = [];
      _ref = preBook.spine;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chapter = _ref[_i];
        chapterpath = path.join(preBook.basedir, chapter);
        chapterpath = unescape(chapterpath);
        xml = epub.readAsText(chapterpath);
        chapters.push(parseChapter.bind(null, xml, chapter));
      }
      log.info('EPUB – extracting chapters');
      return sequence(chapters);
    };
    done = function() {
      return preBook.book;
    };
    opfpath = findOpf(epub.readAsText('META-INF/container.xml'));
    promise = opfpath.then(function(path) {
      return extractOpf(epub.readAsText(path));
    }).then(function() {
      return processNav(epub.readAsText(preBook.navPath));
    }).then(function() {
      return extractAssetsAndCreateBook();
    }).then(function(book) {
      return extractChapters(book);
    }).then(function() {
      return done();
    });
    return promise;
  };

  return EpubLoaderMixin;

})();

extend = function(Book) {
  return utilities.mixin(Book, EpubLoaderMixin);
};

module.exports = {
  extend: extend,
  EpubLoaderMixin: EpubLoaderMixin
};
