'use strict';
var Assets, Book, Chapter, SubOutline, handlebars, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

handlebars = require('handlebars');

helpers = require('./hbs.js');

Assets = require('./assets.coffee');

Chapter = require('./chapter.coffee');

Book = (function() {
  var context;

  function Book(meta, assets, sharedAssets) {
    this.assets = assets;
    this.sharedAssets = sharedAssets;
    helpers.register(handlebars);
    this.chapters = [];
    this.root = meta.bookFolder || process.cwd();
    this.meta = meta;
    if (!this.assets) {
      this.assetsFolder = this.meta.assetsFolder || 'assets/';
      this.assets = new Assets(this.root, this.assetsFolder);
    }
    if (this.meta.sharedAssetsFolder && !(this.sharedAssets != null)) {
      this.sharedAssets = new Assets(this.meta.sharedAssetsRoot, this.meta.sharedAssetsFolder);
    }
    this.docIdCount = 0;
  }

  Book.prototype.docID = function() {
    docIdCount++;
    return "doc" + docIdCount;
  };

  Book.prototype.addChapter = function(chapter) {
    chapter.book = this;
    if (!chapter.id) {
      chapter.id = this.docId();
    }
    if (!chapter.filename) {
      chapter.filename = 'chapters/doc' + chapter.id + '.html';
    }
    if (chapter.subChapters) {
      chapter.subChapters = new SubOutline(chapter.subChapters, this);
    }
    return this.chapters.push(chapter);
  };

  Book.prototype.everyChapter = function(callback) {
    var chapter, _i, _len, _ref, _results;

    _ref = this.chapters;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      callback(chapter);
      if (chapter.subChapters) {
        _results.push(chapter.subChapters.everyChapter(callback));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  context = function() {
    context = {
      meta: this.meta,
      assets: this.assets,
      outline: this.chapters
    };
    return context;
  };

  return Book;

})();

SubOutline = (function(_super) {
  __extends(SubOutline, _super);

  function SubOutline(sub, book) {
    var chapter, entry, _i, _len;

    this.book = book;
    this.chapters = [];
    for (_i = 0, _len = sub.length; _i < _len; _i++) {
      entry = sub[_i];
      if (typeof entry === 'string') {
        this.loadFile(entry);
      } else {
        chapter = new Chapter(entry);
        chapter.book = this.book;
        if (entry.subChapters) {
          chapter.subChapters = new SubOutline(entry.subChapters, this);
        }
        this.addChapter(chapter);
      }
    }
    ({
      docID: function() {
        return this.book.docID();
      }
    });
  }

  return SubOutline;

})(Book);

require('./epub.coffee').extend(Chapter, Book, Assets);

require('./loaders.coffee').extend(Book);

module.exports = {
  Book: Book,
  SubOutline: SubOutline
};
