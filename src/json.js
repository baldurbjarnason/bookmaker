'use strict';
var Assets, Book, Chapter, SubOutline, bookmaker, ensuredir, extend, extendAssets, extendBook, extendChapter, filter, fs, mkdirp, nodefn, path, relative, sequence, url, whenjs, write, _;

fs = require('fs');

bookmaker = require('./index');

Assets = bookmaker.Assets;

Chapter = bookmaker.Chapter;

Book = bookmaker.Book;

SubOutline = bookmaker.SubOutline;

whenjs = require('when');

_ = require('underscore');

path = require('path');

sequence = require('when/sequence');

fs = require('fs');

nodefn = require("when/node/function");

mkdirp = require('mkdirp');

url = require('url');

ensuredir = function(directory) {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  mkdirp(directory, function(err) {
    if (err) {
      return deferred.reject(err);
    } else {
      return deferred.resolve();
    }
  });
  return promise;
};

write = function(filename, data) {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  fs.writeFile(filename, data, function(err) {
    if (err) {
      return deferred.reject(err);
    } else {
      return deferred.resolve();
    }
  });
  return promise;
};

extend = function(Chapter, Book, Assets) {
  extendChapter(Chapter);
  extendBook(Book);
  return extendAssets(Assets);
};

filter = function(key, value) {
  if (key === "") {
    return value;
  }
  if (key === 'toJSON') {
    return "";
  }
  return value;
};

relative = function(current, target) {
  var absolutecurrent, absolutetarget, relativetarget;

  absolutecurrent = path.dirname(path.resolve("/", current));
  absolutetarget = path.resolve("/", target);
  relativetarget = path.relative(absolutecurrent, absolutetarget);
  return relativetarget;
};

extendChapter = function(Chapter) {
  Chapter.prototype.toHal = function() {
    var banned, hal, href, selfindex, selfpath, subChapter, subChapters, tocpath, urlgen, _i, _len, _ref, _ref1, _ref2, _ref3;

    banned = ['links', 'book', 'meta', 'filename', 'assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this));
    hal = _.omit(this, banned);
    hal.body = this.html;
    hal.type = 'html';
    urlgen = this.book.uri.bind(this.book) || relative;
    tocpath = path.relative(path.resolve("/", path.dirname(this.filename)), "/index.json");
    selfpath = ((_ref = this.book._state) != null ? _ref.baseurl : void 0) ? this.book._state.baseurl + this.formatPath('json') : path.basename(this.formatPath('json'));
    hal._links = {
      toc: {
        href: tocpath,
        name: 'TOC-JSON',
        type: "application/hal+json"
      },
      self: {
        href: selfpath,
        type: "application/hal+json"
      }
    };
    if (((_ref1 = this.book.assets) != null ? _ref1.css : void 0) && !this.book.meta.specifiedCss) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref2, _results;

        _ref2 = this.book.assets.css;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          href = _ref2[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "text/css"
          });
        }
        return _results;
      }).call(this);
    } else if (this.css) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref2, _results;

        _ref2 = this.css;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          href = _ref2[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "text/css"
          });
        }
        return _results;
      }).call(this);
    }
    if (((_ref2 = this.book.assets) != null ? _ref2.js : void 0) && !this.book.meta.specifiedJs) {
      hal._links.javascript = (function() {
        var _i, _len, _ref3, _results;

        _ref3 = this.book.assets.js;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          href = _ref3[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "application/javascript"
          });
        }
        return _results;
      }).call(this);
    } else if (this.js) {
      hal._links.javascript = (function() {
        var _i, _len, _ref3, _results;

        _ref3 = this.js;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          href = _ref3[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "application/javascript"
          });
        }
        return _results;
      }).call(this);
    }
    selfindex = this.book.chapters.indexOf(this);
    if (selfindex !== -1) {
      if (selfindex !== 0) {
        hal._links.prev = {
          href: urlgen(this.filename, this.book.chapters[selfindex - 1].formatPath('json')),
          type: "application/hal+json"
        };
      }
      if (selfindex !== this.book.chapters.length - 1) {
        hal._links.next = {
          href: urlgen(this.filename, this.book.chapters[selfindex + 1].formatPath('json')),
          type: "application/hal+json"
        };
      }
    }
    if (this.subChapters) {
      subChapters = [];
      _ref3 = this.subChapters.chapters;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        subChapter = _ref3[_i];
        subChapters.push(subChapter);
      }
      hal._embedded.chapters = subChapters;
    }
    return hal;
  };
  Chapter.prototype.toJSON = function() {
    var hal;

    hal = this.toHal();
    return JSON.stringify(hal, filter, 2);
  };
  return Chapter;
};

extendAssets = function(Assets) {
  return Assets;
};

extendBook = function(Book) {
  Book.prototype.uri = function(current, target) {
    if (this._state.baseurl) {
      return url.resolve(this.baseurl, target);
    } else {
      return this.relative(current, target);
    }
  };
  Book.prototype.toHal = function(options) {
    var chapter, covertype, hal, href, image, selfpath, stylesheet, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;

    this._state = {};
    hal = {};
    _.extend(hal, this.meta);
    if (options != null ? options.baseurl : void 0) {
      selfpath = options.baseurl + 'index.json';
      this._state.baseurl = options.baseurl;
    } else if (this.baseurl) {
      this._state.baseurl = this.baseurl;
    } else {
      selfpath = 'index.json';
    }
    if (!hal._links) {
      hal._links = {};
    }
    hal._links.self = {
      href: selfpath,
      type: "application/hal+json",
      hreflang: this.meta.lang
    };
    if (path.extname(this.meta.cover) === '.jpg') {
      covertype = 'image/jpeg';
    }
    if (path.extname(this.meta.cover) === '.png') {
      covertype = 'image/png';
    }
    if (path.extname(this.meta.cover) === '.svg') {
      covertype = 'image/svg+xml';
    }
    hal._links.cover = [
      {
        href: this.uri('index.json', this.meta.cover),
        type: covertype,
        title: 'Cover Image'
      }
    ];
    if (this.meta.start) {
      hal._links.start = {
        href: this.uri('index.json', this.meta.start.formatPath('json')),
        type: "application/hal+json"
      };
    }
    if (!(options != null ? options.embedChapters : void 0)) {
      hal._links.chapters = (function() {
        var _i, _len, _ref, _results;

        _ref = this.chapters;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chapter = _ref[_i];
          _results.push({
            href: this.uri('index.json', chapter.formatPath('json')),
            type: "application/hal+json",
            hreflang: this.meta.lang
          });
        }
        return _results;
      }).call(this);
    } else {
      hal._links.chapters = this.chapters;
    }
    hal._links.images = [];
    _ref = this.assets.png;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      image = _ref[_i];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/png"
      });
    }
    _ref1 = this.assets.jpg;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      image = _ref1[_j];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/jpeg"
      });
    }
    _ref2 = this.assets.gif;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      image = _ref2[_k];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/gif"
      });
    }
    _ref3 = this.assets.svg;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      image = _ref3[_l];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/svg+xml"
      });
    }
    hal._links.stylesheets = (function() {
      var _len4, _m, _ref4, _results;

      _ref4 = this.assets.css;
      _results = [];
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        stylesheet = _ref4[_m];
        _results.push({
          href: this.uri('index.json', stylesheet),
          type: "text/css"
        });
      }
      return _results;
    }).call(this);
    hal._links.javascript = (function() {
      var _len4, _m, _ref4, _results;

      _ref4 = this.assets.js;
      _results = [];
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        href = _ref4[_m];
        _results.push({
          href: this.uri('index.json', href),
          type: "application/javascript"
        });
      }
      return _results;
    }).call(this);
    hal.date = this.meta.date.isoDate;
    delete hal.cover;
    delete hal.start;
    hal.modified = this.meta.modified.isoDate;
    return hal;
  };
  Book.prototype.toJSON = function(options) {
    var hal;

    hal = this.toHal(options);
    return JSON.stringify(hal, filter, 2);
  };
  Book.prototype.toJsonFiles = function(directory, options) {
    var chapter, hal, json, report, tasks, _i, _len, _ref;

    report = function(thing) {
      return console.log(thing);
    };
    sequence(tasks);
    hal = this.toHal(options);
    hal.assetsPath = this.assets.assetsPath;
    json = JSON.stringify(hal, filter, 2);
    tasks = [];
    if (directory) {
      tasks.push(ensuredir(directory));
    } else {
      directory = directory || process.cwd();
    }
    tasks.push(ensuredir(directory + 'chapters/'));
    tasks.push(this.assets.copy(directory + hal.assetsPath));
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      tasks.push(write(directory + chapter.formatPath('json'), chapter.toJSON(), 'utf8'));
    }
    tasks.push(write(directory + 'index.json', json, 'utf8'));
    return whenjs.all(tasks);
  };
  return Book;
};

module.exports = {
  extend: extend
};
