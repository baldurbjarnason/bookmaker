'use strict';
var Assets, Chapter, SubOutline, fs, loadFile, loadTxt, path, yaml;

fs = require('fs');

path = require('path');

yaml = require('js-yaml');

Assets = require('./assets');

Chapter = require('./chapter');

SubOutline = require('./book').SubOutline;

loadFile = function(filename) {
  var basepath, doc, docs, file;

  file = fs.readFileSync(path.resolve(this.root, 'chapters', filename), 'utf8');
  docs = [];
  yaml.safeLoadAll(mainfile, function(doc) {
    return docs.push(doc);
  });
  doc = docs[0];
  if (docs[1] != null) {
    doc.body = docs[1];
  }
  doc.type = path.extname(filename).replace(".", "");
  basepath = path.basename(filename, path.extname(filename));
  doc.filename = 'chapters/' + basepath + '.html';
  doc.render = true;
  return this.addChapter(new Chapter(doc));
};

loadTxt = function(booktxt) {
  var builtIns, emptyline, filename, indentregex, index, list, suboutline, subparent, _i, _len;

  suboutline = [];
  builtIns = {
    'toc': {
      id: 'nav',
      filename: 'index.html',
      render: false,
      title: 'Table of Contents',
      nomanifest: true,
      majornavitem: true,
      template: 'nav.hbs',
      toc: true
    },
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
      this.addChapter(new Chapter(builtIns[filename]));
    } else if ((filename[0] === '#') || (filename.match(emptyline))) {

    } else if (filename.match(indentregex)) {
      if (!index) {
        subparent = this.chapters[this.chapters.length - 1];
        index = true;
      }
      filename = filename.trim();
      suboutline.push(filename);
    } else {
      this.loadFile(filename);
      if (index) {
        subparent.sub = new SubOutline(subOutline, this);
        index = false;
        suboutline = [];
      }
    }
    return;
  }
  return this;
};

module.exports = {
  extend: function(Book) {
    Book.prototype.loadTxt = loadTxt;
    return Book.prototype.loadFile = loadFile;
  }
};
