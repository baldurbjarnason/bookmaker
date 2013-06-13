'use strict';
var Assets, Book, Chapter, dateProcess, handlebars, path, sequence, utilities, whenjs;

handlebars = require('handlebars');

Assets = require('./assets');

Chapter = require('./chapter');

path = require('path');

utilities = require('./utilities');

whenjs = require('when');

sequence = require('when/sequence');

Book = (function() {
  function Book(meta, assets, sharedAssets) {
    var fn, _i, _len, _ref;

    this.assets = assets;
    this.sharedAssets = sharedAssets;
    this.chapters = [];
    this.meta = meta;
    this.meta.date = meta.date ? dateProcess(meta.date) : dateProcess();
    this.meta.modified = meta.modified ? dateProcess(meta.modified) : dateProcess();
    this.meta.copyrightYear = meta.copyrightYear || meta.date.dateYear;
    this.meta.version = meta.version || "0.1";
    this.meta.lang = meta.lang || 'en';
    if (!meta.bookId) {
      this.meta.bookId = 'id' + require('crypto').randomBytes(16).toString('hex');
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
    return this.chapters.push(chapter);
  };

  Book.prototype.relative = utilities.relative;

  Book.prototype.addChaptersToZip = function(zip, template) {
    var chapter, context, tasks, _i, _len, _ref;

    tasks = [];
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      context = chapter.context(this);
      tasks.push(context.addToZip.bind(context, zip, template));
    }
    return sequence(tasks);
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

module.exports = {
  Book: Book
};
