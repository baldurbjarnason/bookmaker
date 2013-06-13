'use strict';
var Assets, Book, Chapter, arrayToBook, bookmaker, chapterToYaml, chaptergen, extend, fs, loadYaml, path, sequence, stripre, titlecounter, titlegen, titlere, whenjs, yaml, yamlLoader, yamlWriter, _;

fs = require('fs');

yaml = require('js-yaml');

bookmaker = require('./index');

Assets = bookmaker.Assets;

Chapter = bookmaker.Chapter;

Book = bookmaker.Book;

whenjs = require('when');

_ = require('underscore');

path = require('path');

sequence = require('when/sequence');

titlecounter = 0;

titlere = new RegExp('^# (.+)', 'm');

stripre = new RegExp('\\W', 'g');

titlegen = function(chapter) {
  var title;

  title = titlere.exec(chapter)[1];
  if (title) {
    return title;
  } else {
    titlecounter += 1;
    title = titlecounter;
    return title;
  }
};

chaptergen = function(chapter) {
  var filename, title;

  title = titlere.exec(chapter)[1];
  if (title) {
    filename = title.replace(stripre, '') + '.html';
  } else {
    titlecounter += 1;
    title = titlecounter;
    filename = 'chapters/' + 'doc' + titlecounter + '.html';
  }
  return {
    title: title,
    filename: filename,
    type: 'md',
    body: chapter
  };
};

arrayToBook = function(docs, assets) {
  var chapter, chapters, entry, mdBook, meta, _i, _len;

  meta = docs[0];
  chapters = docs.slice(1);
  mdBook = new Book(meta, assets);
  for (_i = 0, _len = chapters.length; _i < _len; _i++) {
    entry = chapters[_i];
    if (typeof entry === 'string') {
      chapter = new Chapter(chaptergen(entry));
    } else {
      chapter = new Chapter(entry);
    }
    mdBook.addChapter(chapter);
  }
  return mdBook;
};

loadYaml = function(filename, meta, assets) {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      return deferred.reject;
    } else {
      return yamlLoader(data, filename, meta, deferred.resolver, assets);
    }
  });
  return promise;
};

yamlLoader = function(data, filename, meta, resolver, assets) {
  var docs, root, yamlfile;

  yamlfile = data;
  docs = [];
  yaml.safeLoadAll(yamlfile, function(doc) {
    docs.push(doc);
  });
  if ((typeof docs[0] === 'string') && (meta != null)) {
    docs.unshift(meta);
  }
  if (docs[0].assetsPath && !assets) {
    root = path.dirname(path.resolve(process.cwd(), filename));
    assets = new Assets(root, docs[0].assetsPath);
  }
  return resolver.resolve(arrayToBook(docs, assets));
};

chapterToYaml = function(chapter) {
  var entry, omitted;

  entry = {};
  omitted = _.methods(chapter);
  omitted.push('book');
  entry = _.omit(chapter, omitted);
  return entry;
};

extend = function(Book) {
  Book.prototype.toYaml = function(filename, options) {
    var directory, tasks;

    directory = path.dirname(filename + this.assetsPath);
    tasks = [this.assets.copy(directory), yamlWriter(filename, options, this)];
    return sequence(tasks);
  };
  return Book;
};

yamlWriter = function(filename, options, book, resolver) {
  var chapter, deferred, entry, meta, out, promise, _i, _len, _ref;

  deferred = whenjs.defer();
  promise = deferred.promise;
  if (filename instanceof fs.WriteStream) {
    out = filename;
  } else {
    out = fs.createWriteStream(filename);
  }
  meta = {};
  _.extend(meta, book.meta);
  meta.date = book.meta.date.date.toString();
  out.write(yaml.safeDump(meta));
  out.write('\n---\n');
  _ref = book.chapters;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    chapter = _ref[_i];
    entry = chapterToYaml(chapter);
    out.write(yaml.safeDump(entry));
    out.write('\n---\n');
  }
  out.end(deferred.resolve);
  return promise;
};

module.exports = {
  loadYaml: loadYaml,
  extend: extend
};
