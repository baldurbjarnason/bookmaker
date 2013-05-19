'use strict';
var Assets, Book, Chapter, SubOutline, bookmaker, extend, extendAssets, extendBook, extendChapter, filter, fs, path, sequence, whenjs, _;

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

extendChapter = function(Chapter) {
  Chapter.prototype.toHal = function() {
    var banned, hal, href, selfindex, selfpath, subChapter, subChapters, tocpath, _i, _len, _ref, _ref1, _ref2;

    banned = ['book', 'meta', 'assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this));
    hal = _.omit(this, banned);
    hal.body = this.html;
    hal.type = 'html';
    tocpath = path.relative(path.resolve("/", path.dirname(this.filename)), "/index.json");
    selfpath = this.formatPath('json');
    hal._links = {
      toc: {
        href: tocpath,
        name: 'JSON'
      },
      self: {
        href: selfpath
      }
    };
    if (((_ref = this.book.assets) != null ? _ref.css : void 0) && !this.book.meta.specifiedCss) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.book.assets.css;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          href = _ref1[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    } else if (this.css) {
      hal._links.javascript = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.js;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          href = _ref1[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    }
    if (((_ref1 = this.book.assets) != null ? _ref1.js : void 0) && !this.book.meta.specifiedJs) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref2, _results;

        _ref2 = this.book.assets.css;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          href = _ref2[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    } else if (this.js) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref2, _results;

        _ref2 = this.js;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          href = _ref2[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    }
    selfindex = this.book.chapters.indexOf(this);
    if (selfindex !== 0) {
      hal._links.prev = {
        href: this.book.chapters[selfindex - 1].formatPath()
      };
    }
    if (selfindex !== this.book.chapters.length - 1) {
      hal._links.next = {
        href: this.book.chapters[selfindex + 1].formatPath()
      };
    }
    if (this.subChapters) {
      subChapters = [];
      _ref2 = this.subChapters.chapters;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        subChapter = _ref2[_i];
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
  Book.prototype.toHal = function(options) {
    var chapter, hal, selfpath;

    hal = {};
    _.extend(hal, this.meta);
    selfpath = 'index.json';
    hal._links = {
      self: {
        href: selfpath
      }
    };
    hal._links.cover = {
      href: this.meta.cover
    };
    hal._links.start = {
      href: this.meta.start.formatPath('json')
    };
    if (!(options != null ? options.embedChapters : void 0)) {
      hal._links.chapters = (function() {
        var _i, _len, _ref, _results;

        _ref = this.chapters;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chapter = _ref[_i];
          _results.push({
            href: chapter.formatPath('json')
          });
        }
        return _results;
      }).call(this);
    } else {
      hal._links.chapters = this.chapters;
    }
    hal._links.images = this.assets.png.concat(this.assets.jpg, this.assets.gif, this.assets.svg);
    hal._links.stylesheets = this.assets.css;
    hal._links.javascript = this.assets.js;
    hal.date = this.meta.date.date.toString();
    hal.cover = null;
    hal.start = this.meta.start.formatPath('json');
    hal.modified = this.meta.modified.date.toString();
    return hal;
  };
  Book.prototype.toJSON = function(options) {
    var hal;

    hal = this.toHal(options);
    console.log(JSON.stringify(hal, filter, 2));
    return JSON.stringify(hal, filter, 2);
  };
  return Book;
};

module.exports = {
  extend: extend
};
