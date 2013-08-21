'use strict';
var Assets, Book, Chapter, dateProcess, path, sequence, utilities, whenjs;

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

  Book.prototype.chapterPrepare = function(chapter, bookoverride) {
    chapter.book = this || bookoverride;
    if (!chapter.id) {
      chapter.id = this.docId();
    }
    if (!chapter.filename) {
      chapter.filename = 'chapters/' + chapter.id + '.html';
    }
    return chapter;
  };

  Book.prototype.addChapter = function(chapter, bookoverride) {
    this.chapterPrepare(chapter, bookoverride);
    return this.chapters.push(chapter);
  };

  Book.prototype.prependChapter = function(chapter, bookoverride) {
    this.chapterPrepare(chapter, bookoverride);
    return this.chapters.unshift(chapter);
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

  Book.prototype.appendMain = function(chapter, bookoverride) {
    var landmarkHref;

    this.chapterPrepare(chapter, bookoverride);
    landmarkHref = findLandmarkHref('backmatter');
    if (landmarkHref) {
      return insertBeforeHref(landmarkHref, chapters);
    } else {
      return this.addChapter(chapter);
    }
  };

  Book.prototype.prependMain = function(chapter, bookoverride) {
    var landmarkHref;

    this.chapterPrepare(chapter, bookoverride);
    landmarkHref = findLandmarkHref('bodymatter');
    if (landmarkHref) {
      insertBeforeHref(landmarkHref, chapter);
      return updateLandmark('bodymatter', landmarkHref);
    } else {
      return this.prependChapter(chapter);
    }
  };

  Book.prototype.appendFront = function(chapter, bookoverride) {
    var landmarkHref;

    this.chapterPrepare(chapter, bookoverride);
    landmarkHref = findLandmarkHref('bodymatter');
    if (landmarkHref) {
      return insertBeforeHref(landmarkHref, chapter);
    } else {
      return this.prependChapter(chapter);
    }
  };

  Book.prototype.prependFront = function(chapter, bookoverride) {
    var landmarkHref;

    this.chapterPrepare(chapter, bookoverride);
    landmarkHref = findLandmarkHref('frontmatter');
    if (landmarkHref) {
      insertBeforeHref(landmarkHref, chapter);
      return updateLandmark('frontmatter', landmarkHref);
    } else {
      return this.prependChapter(chapter);
    }
  };

  Book.prototype.appendBack = Book.addChapter;

  Book.prototype.prependBack = function(chapter, bookoverride) {
    var landmarkHref;

    this.chapterPrepare(chapter, bookoverride);
    landmarkHref = findLandmarkHref('backmatter');
    if (landmarkHref) {
      insertBeforeHref(landmarkHref, chapter);
      return updateLandmark('backmatter', landmarkHref);
    } else {
      return this.addChapter(chapter);
    }
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
