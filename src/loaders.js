'use strict';
var LoaderMixin, extend, fs, path, utilities, yaml;

fs = require('fs');

path = require('path');

yaml = require('js-yaml');

utilities = require('./utilities');

LoaderMixin = (function() {
  function LoaderMixin() {}

  LoaderMixin.loadBookDir = function(directory) {
    var Assets, Book, Chapter, NewBook, SubOutline, assets, book, booktxt, chapter, loadFile, loadTxt, mdchaptergen, meta, stripre, titlecounter, titlere, _i, _len, _ref;

    titlecounter = 0;
    titlere = new RegExp('^# (.+)', 'm');
    stripre = new RegExp('\\W', 'g');
    mdchaptergen = function(chapter) {
      var title, _ref;

      title = (_ref = titlere.exec(chapter)) != null ? _ref[1] : void 0;
      if (title) {
        return {
          title: title,
          body: chapter
        };
      } else {
        titlecounter += 1;
        title = titlecounter + "";
        return {
          title: title,
          body: ("# " + title + "\n\n") + chapter
        };
      }
    };
    Chapter = this.Chapter;
    Book = this;
    SubOutline = this.SubOutline;
    Assets = this.Assets;
    loadFile = function(filename, book) {
      var basepath, doc, docs, file, type;

      if (fs.existsSync(path.resolve(directory, 'chapters', filename))) {
        file = fs.readFileSync(path.resolve(directory, 'chapters', filename), 'utf8');
      }
      type = path.extname(filename).replace(".", "");
      if (type === 'md') {
        doc = mdchaptergen(file);
      } else {
        docs = file.split('---');
        doc = yaml.safeLoad(docs[1]);
        if (docs[2] != null) {
          doc.body = docs[2];
        }
      }
      doc.type = type;
      basepath = path.basename(filename, path.extname(filename));
      doc.filename = 'chapters/' + basepath + '.html';
      return book.addChapter(new Chapter(doc));
    };
    loadTxt = function(booktxt, book) {
      var emptyline, filename, indentregex, index, list, suboutline, subparent, _i, _len;

      suboutline = [];
      list = booktxt.trim().split(/\n/);
      emptyline = /^\s$/;
      indentregex = /^[ \t]+/;
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        filename = list[_i];
        if ((filename[0] === '#') || (filename.match(emptyline))) {

        } else if (filename.match(indentregex)) {
          if (!index) {
            subparent = book.chapters[book.chapters.length - 1];
            index = true;
          }
          filename = filename.trim();
          suboutline.push(filename);
        } else {
          loadFile(filename, book);
          if (index) {
            subparent.subChapters = new SubOutline(suboutline, this);
            index = false;
            suboutline = [];
          }
        }
      }
      return;
      return book;
    };
    if (fs.existsSync(directory + 'meta.yaml')) {
      meta = yaml.safeLoad(fs.readFileSync(directory + 'meta.yaml', 'utf8'));
    } else if (fs.existsSync(directory + 'meta.json')) {
      meta = JSON.parse(fs.readFileSync(directory + 'meta.json', 'utf8'));
    } else {
      return;
    }
    if (meta.assetsPath) {
      assets = new Assets(directory, meta.assetsPath);
    } else {
      assets = new Assets(directory, 'assets/');
    }
    NewBook = this;
    book = new NewBook(meta, assets);
    if (fs.existsSync(directory + 'book.txt')) {
      booktxt = fs.readFileSync(directory + 'book.txt', 'utf8');
    } else {
      return;
    }
    loadTxt(booktxt, book);
    if (book.meta.start) {
      if (!book.meta.landmarks) {
        book.meta.landmarks = [];
        _ref = book.chapters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chapter = _ref[_i];
          if (chapter.filename === book.meta.start) {
            book.meta.landmarks.push({
              type: "bodymatter",
              title: chapter.title,
              href: chapter.filename
            });
          }
        }
      }
    }
    return book;
  };

  return LoaderMixin;

})();

extend = function(Book) {
  return utilities.mixin(Book, LoaderMixin);
};

module.exports = {
  extend: extend,
  LoaderMixin: LoaderMixin
};
