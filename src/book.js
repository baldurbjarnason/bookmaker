'use strict';
var Assets, Book, Chapter, SubOutline, dateProcess, handlebars, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

handlebars = require('handlebars');

Assets = require('./assets');

Chapter = require('./chapter');

path = require('path');

Book = (function() {
  function Book(meta, assets, sharedAssets) {
    var fn, _i, _len, _ref;

    this.assets = assets;
    this.sharedAssets = sharedAssets;
    this.chapters = [];
    this.root = meta.root || process.cwd();
    this.meta = meta;
    this.meta.date = meta.date ? dateProcess(meta.date) : dateProcess();
    this.meta.modified = dateProcess();
    this.meta.copyrightYear = meta.copyrightYear || meta.date.dateYear;
    this.meta.version = meta.version || "0.1";
    this.meta.lang = meta.lang || 'en';
    if (!meta.bookId) {
      this.meta.bookId = require('crypto').randomBytes(16).toString('hex');
    }
    this._chapterIndex = 0;
    this._navPoint = 0;
    this._globalCounter = 0;
    if (this.init) {
      _ref = this.init;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fn = _ref[_i];
        fn(this);
      }
    }
    if (!this.assets) {
      this.assetsFolder = this.meta.assetsFolder || 'assets/';
      this.assets = new Assets(this.root, this.assetsFolder);
    }
    if (this.meta.sharedAssetsFolder && !(this.sharedAssets != null)) {
      this.sharedAssets = new Assets(this.meta.sharedAssetsRoot, this.meta.sharedAssetsFolder);
    }
    this.docIdCount = 0;
  }

  Book.prototype.docId = function() {
    this.docIdCount++;
    return "doc" + this.docIdCount;
  };

  Book.prototype.addChapter = function(chapter, bookoverride) {
    chapter.book = this || bookoverride;
    if (!chapter.id) {
      chapter.id = this.docId();
    }
    if (!chapter.filename) {
      chapter.filename = 'chapters/' + chapter.id + '.html';
    }
    if (chapter.subChapters) {
      chapter.subChapters = new SubOutline(chapter.subChapters, this);
    }
    return this.chapters.push(chapter);
  };

  return Book;

})();

dateProcess = function(date) {
  var pad, _date, _meta;

  pad = function(n) {
    var padded;

    if (n < 10) {
      padded = '0' + n;
    } else {
      padded = n;
    }
    return padded;
  };
  _meta = {};
  if (date != null) {
    _date = new Date(date);
  } else {
    _date = new Date();
  }
  _meta.date = _date;
  _meta.dateYear = _date.getUTCFullYear();
  _meta.dateDay = pad(_date.getUTCDate());
  _meta.dateMonth = pad(_date.getUTCMonth() + 1);
  _meta.dateHours = pad(_date.getUTCHours());
  _meta.dateMinutes = pad(_date.getUTCMinutes());
  _meta.dateSeconds = pad(_date.getUTCSeconds());
  _meta.isoDate = "" + _meta.dateYear + "-" + _meta.dateMonth + "-" + _meta.dateDay + "T" + _meta.dateHours + ":" + _meta.dateMinutes + ":" + _meta.dateSeconds + "Z";
  return _meta;
};

SubOutline = (function(_super) {
  __extends(SubOutline, _super);

  function SubOutline(sub, book) {
    var chapter, entry, _i, _len;

    this.book = book;
    this.chapters = [];
    for (_i = 0, _len = sub.length; _i < _len; _i++) {
      entry = sub[_i];
      chapter = new Chapter(entry);
      if (entry.subChapters) {
        chapter.subChapters = new SubOutline(entry.subChapters, this.book);
      }
      this.addChapter(chapter, this.book);
    }
    ({
      docId: function() {
        var id;

        id = this.book.docId();
        return id;
      }
    });
  }

  return SubOutline;

})(Book);

module.exports = {
  Book: Book,
  SubOutline: SubOutline
};
