'use strict';
var LoaderMixin, extend, fs, path, utilities, yaml;

fs = require('fs');

path = require('path');

yaml = require('js-yaml');

utilities = require('./utilities');

LoaderMixin = (function() {
  function LoaderMixin() {}

  LoaderMixin.loadBookDir = function(directory) {
    var NewBook, assets, book, booktxt, loadFile, loadTxt, meta;

    loadFile = function(filename, book) {
      var basepath, doc, docs, file;

      file = fs.readFileSync(path.resolve(directory, 'chapters', filename), 'utf8');
      docs = [];
      yaml.safeLoadAll(file, function(doc) {
        return docs.push(doc);
      });
      doc = docs[0];
      if (docs[1] != null) {
        doc.body = docs[1];
      }
      doc.type = path.extname(filename).replace(".", "");
      basepath = path.basename(filename, path.extname(filename));
      doc.filename = 'chapters/' + basepath + '.html';
      return book.addChapter(new this.Chapter(doc));
    };
    loadTxt = function(booktxt, book) {
      var builtIns, emptyline, filename, indentregex, index, list, suboutline, subparent, _i, _len;

      suboutline = [];
      builtIns = {
        'title': {
          id: 'titlepage',
          filename: 'title.html',
          title: 'Title Page',
          render: true,
          template: 'title.hbs',
          majornavitem: true
        },
        'titletoc': {
          id: 'titletoc',
          filename: 'title.html',
          title: 'Contents',
          render: true,
          template: 'titletoc.hbs',
          majornavitem: true,
          toc: true
        }
      };
      list = booktxt.trim().split(/\n/);
      emptyline = /^\s$/;
      indentregex = /^[ \t]+/;
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        filename = list[_i];
        if (builtIns[filename]) {
          book.addChapter(new this.Chapter(builtIns[filename]));
        } else if ((filename[0] === '#') || (filename.match(emptyline))) {

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
            subparent.subChapters = new this.SubOutline(suboutline, this);
            index = false;
            suboutline = [];
          }
        }
        return;
      }
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
      assets = new this.Assets(directory, meta.assetsPath);
    } else {
      assets = new this.Assets(directory, 'assets/');
    }
    NewBook = this;
    book = new NewBook(meta, assets);
    if (fs.existsSync(directory + 'book.txt')) {
      booktxt = fs.readFileSync(directory + 'book.txt', 'utf8');
    } else {
      return;
    }
    loadTxt(booktxt, book);
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
