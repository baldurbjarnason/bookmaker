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

log = require('./logger').logger;

bodyre = new RegExp('<body [^>]*>([\\w|\\W]*)</body>', 'm');

EpubLoaderMixin = (function() {
  function EpubLoaderMixin() {}

  EpubLoaderMixin.fromEpub = function(epubpath, assetsroot) {
    var Assets, Book, Chapter, createMetaAndSpine, epub, extractAssetsAndCreateBook, extractChapters, extractOpf, findOpf, opfpath, parseChapter, preBook, processNav, promise;

    epub = new Zip(epubpath);
    Chapter = this.Chapter;
    Book = this;
    Assets = this.Assets;
    preBook = {};
    findOpf = function(xml) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      parseString(xml, function(err, result) {
        var rootfile;

        if (err) {
          log.error(err);
        }
        rootfile = result.container.rootfiles[0].rootfile[0].$['full-path'];
        return deferred.resolve(rootfile);
      });
      return promise;
    };
    extractOpf = function(xml) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      parseString(xml, function(err, result) {
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
      meta.author = metadata['dc:creator'][0]._;
      meta.title = metadata['dc:title'][0]._;
      if (metadata['dc:creator'][1]) {
        meta.author2 = metadata['dc:creator'][1]._;
      }
      meta.lang = metadata['dc:language'][0]._;
      meta.date = metadata['dc:date'][0]._;
      meta.rights = metadata['dc:rights'][0]._;
      meta.description = metadata['dc:description'][0]._;
      meta.publisher = metadata['dc:publisher'][0]._;
      meta.subject1 = metadata['dc:subject'][0]._;
      if (metadata['dc:subject'][1]) {
        meta.subject2 = metadata['dc:subject'][1]._;
      }
      if (metadata['dc:subject'][2]) {
        meta.subject3 = metadata['dc:subject'][2]._;
      }
      _ref1 = metadata.meta;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        elem = _ref1[_j];
        if (elem.$['property'] === "dcterms:modified") {
          meta.modified = elem._;
        }
        if (elem.$['name'] === 'cover') {
          preBook.coverId = elem._;
        }
        if (elem.$['property'] === 'ibooks:version') {
          meta.version = elem._;
        }
      }
      manifest = xml["package"].manifest[0];
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
          landmarks.push({
            type: type,
            title: reference.$.title,
            href: reference.$.href
          });
        }
      }
      if (landmarks.length > 0) {
        meta.landmarks = landmarks;
      }
      log.info('EPUB – OPF parsed and worked');
      return deferred.resolve(xml);
    };
    processNav = function(xml) {
      var body, deferred, promise;

      if (xml) {
        deferred = whenjs.defer();
        promise = deferred.promise;
        body = bodyre.exec(xml)[1];
        $('body').html(xml);
        preBook.outline = $('nav[epub\\:type=toc]').html();
        deferred.resolve(xml);
        log.info('EPUB – Nav parsed and worked');
        return promise;
      }
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
        epub.extractEntryTo(entry, assetsroot, true, true);
      }
      assets = new Assets(assetsroot);
      preBook.book = new Book(preBook.meta, assets);
      deferred.resolve(preBook.book);
      log.info('EPUB – assets extracted');
      return promise;
    };
    parseChapter = function(xml) {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      parseString(xml, function(err, result) {
        var chapter, css, js, link, links, script, scripts, _i, _j, _len, _len1, _links;

        chapter = {};
        chapter.title = result.html.head[0].title[0]._;
        chapter.type = 'xhtml';
        chapter.body = bodyre.exec(xml)[1];
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
        preBook.book.addChapter(chapter);
        return deferred.resolve(chapter);
      });
      return promise;
    };
    extractChapters = function(book) {
      var chapter, chapters, deferred, promise, xml, _i, _len, _ref;

      deferred = whenjs.defer();
      promise = deferred.promise;
      chapters = [];
      _ref = preBook.spine;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chapter = _ref[_i];
        xml = epub.readAsText(chapter);
        chapters.push(parseChapter.bind(null, xml, book));
      }
      log.info('EPUB – extracting chapters');
      return sequence(chapters);
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
      return preBook.book;
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
