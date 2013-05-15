'use strict';
var Assets, Book, Chapter, SubOutline, handlebars,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

handlebars = require('handlebars');

Assets = require('./assets');

Chapter = require('./chapter');

Book = (function() {
  function Book(meta, assets, sharedAssets) {
    this.assets = assets;
    this.sharedAssets = sharedAssets;
    this.chapters = [];
    this.root = meta.bookFolder || process.cwd();
    this.meta = meta;
    this._chapterIndex = 1;
    this._navPoint = 1;
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

  Book.prototype.context = function() {
    var context;

    context = {
      meta: this.meta,
      assets: this.assets,
      chapters: this.chapters
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
