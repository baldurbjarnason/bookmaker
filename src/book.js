'use strict';
var $, Assets, Book, Chapter, async, dateProcess, path, utilities;

Assets = require('./assets');

Chapter = require('./chapter');

path = require('path');

utilities = require('./utilities');

async = require('async');

var cheerio = require('cheerio');

Book = (function() {
  function Book(meta, assets) {
    var fn, _i, _len, _ref;
    this.assets = assets;
    this.chapters = [];
    this.meta = meta;
    this.generate = {};
    this.meta.date = meta.date ? dateProcess(meta.date) : dateProcess();
    this.meta.modified = meta.modified ? dateProcess(meta.modified) : dateProcess();
    this.meta.copyrightYear = meta.copyrightYear || meta.date.dateYear;
    this.meta.version = meta.version || "0.1";
    this.meta.lang = meta.lang || 'en';
    if (!meta.bookId) {
      this.meta.bookId = 'id' + require('crypto').randomBytes(16).toString('hex');
    }
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

  Book.prototype.chapterPrepare = function(chapter) {
    chapter.book = this;
    if (!chapter.id) {
      chapter.id = this.docId();
    }
    if (!chapter.filename) {
      chapter.filename = 'chapters/' + chapter.id + '.html';
    }
    return chapter;
  };

  Book.prototype.addChapter = function(chapter, options, callback) {
    var chap, index, landmarkHrefs, type, _i, _len, _ref;
    this.chapterPrepare(chapter);
    if (typeof options === 'function') {
      callback = options;
    }
    if (options != null ? options.ignoreLandmarks : void 0) {
      landmarkHrefs = (function() {
        var _i, _len, _ref, _results;
        _ref = options.ignoreLandmarks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _results.push(this.findLandmarkHref(type));
        }
        return _results;
      }).call(this);
      _ref = this.chapters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        chap = _ref[_i];
        index = this.chapters.indexOf(chap);
        if (landmarkHrefs.indexOf(chap.filename === -1)) {
          this.chapters.splice(index + 1, 0, chapter);
          this.appendOutline(chap.filename, chapter);
        }
      }
    } else {
      this.chapters.push(chapter);
      if (options != null ? options.modifyOutline : void 0) {
        this.appendOutline(this.chapters[this.chapters.length - 1].filename, chapter);
      }
    }
    if (callback && typeof callback === 'function') {
      return callback(null, this);
    } else {
      return this;
    }
  };

  Book.prototype.prependChapter = function(chapter, options, callback) {
    var chap, index, landmarkHrefs, type, _i, _ref;
    this.chapterPrepare(chapter);
    if (typeof options === 'function') {
      callback = options;
    }
    if (options != null ? options.ignoreLandmarks : void 0) {
      landmarkHrefs = (function() {
        var _i, _len, _ref, _results;
        _ref = options.ignoreLandmarks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _results.push(this.findLandmarkHref(type));
        }
        return _results;
      }).call(this);
      for (index = _i = _ref = this.chapters.length; _ref <= 1 ? _i <= 1 : _i >= 1; index = _ref <= 1 ? ++_i : --_i) {
        chap = this.chapters[index];
        if (landmarkHrefs.indexOf(chap.filename === -1)) {
          this.chapters.splice(index, 0, chapter);
          this.prependOutline(chap.filename, chapter);
        }
      }
    } else {
      this.chapters.unshift(chapter);
      if (options != null ? options.modifyOutline : void 0) {
        this.prependOutline(this.chapters[0].filename, chapter);
      }
    }
    if (callback && typeof callback === 'function') {
      return callback(null, this);
    } else {
      return this;
    }
  };

  Book.prototype.insertBeforeHref = function(href, newChapter) {
    var chapter, index, _i, _len, _ref;
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      if (chapter.filename === href) {
        index = this.chapters.indexOf(chapter);
      }
    }
    if (index !== -1) {
      return this.chapters.splice(index, 0, newChapter);
    }
  };

  Book.prototype.insertAfterHref = function(href, newChapter) {
    var chapter, index, _i, _len, _ref;
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      if (chapter.filename === href) {
        index = this.chapters.indexOf(chapter);
      }
    }
    if (index !== -1) {
      return this.chapters.splice(index + 1, 0, newChapter);
    }
  };

  Book.prototype.findLandmarkHref = function(landmark) {
    var landmarkHref, _i, _len, _ref;
    _ref = this.meta.landmarks;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      landmark = _ref[_i];
      if (landmark.type === 'bodymatter') {
        landmarkHref = landmark.href;
      }
    }
    return landmarkHref;
  };

  Book.prototype.updateLandmark = function(landmarkType, newLandmark, newTitle) {
    var landmark, _i, _len, _ref, _results;
    _ref = this.meta.landmarks;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      landmark = _ref[_i];
      if (landmark.type === landmarkType) {
        landmark.href = newLandmark;
        if (newTitle) {
          _results.push(landmark.title = newTitle);
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Book.prototype.prependOutline = function(href, chapter) {
    var html;
    if (this.outline) {
      var $ = cheerio.load(this.outline);
      html = "<li id='toc-" + chapter.id + "'><a href='" + chapter.filename + "' rel='chapter'>" + chapter.title + "</a></li>";
      $("a[href='" + href + "']").parent().before(html);
      return this.outline = $('body').html();
    }
  };

  Book.prototype.appendOutline = function(href, chapter) {
    var html;
    if (this.outline) {
      var $ = cheerio.load(this.outline);
      html = "<li id='toc-" + chapter.id + "'><a href='" + chapter.filename + "' rel='chapter'>" + chapter.title + "</a></li>";
      $("a[href='" + href + "']").parent().after(html);
      return this.outline = $('body').html();
    }
  };

  Book.prototype.relative = utilities.relative;

  Book.prototype.addChaptersToZip = function(zip, template, callback) {
    var chapter, context, tasks, _i, _len, _ref;
    tasks = [];
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      context = chapter.context(this);
      tasks.push(context.addToZip.bind(context, zip, template));
    }
    return async.series(tasks, callback);
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
