'use strict';
var Assets, Book, Chapter, SubOutline, bookmaker, fs, loadYaml, titlecounter, titlegen, yaml, yamlToBook;

fs = require('fs');

yaml = require('js-yaml');

bookmaker = require('index');

Assets = bookmaker.Assets;

Chapter = bookmaker.Chapter;

Book = bookmaker.Book;

SubOutline = bookmaker.SubOutline;

titlecounter = 0;

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

yamlToBook = function(docs) {
  var chapter, chapters, entry, mdBook, meta, titlere, _i, _len;

  titlere = new RegExp('^# (.+)', 'm');
  meta = docs[0];
  chapters = docs.slice(1);
  mdBook = new Book(meta);
  for (_i = 0, _len = chapters.length; _i < _len; _i++) {
    entry = chapters[_i];
    if (typeof entry === 'string') {
      chapter = new Chapter({
        title: titlegen(entry),
        type: 'md',
        body: entry
      });
    } else {
      chapter = new Chapter(entry);
      if (entry.subChapters) {
        chapter.subChapters = new SubOutline(entry.subChapters, this);
      }
    }
    mdBook.addChapter(chapter);
  }
  return mdBook;
};

loadYaml = function(filename, meta) {
  var docs, yamlfile;

  yamlfile = fs.readFileSync(filename, 'utf8');
  docs = [];
  yaml.safeLoadAll(yamlfile, function(doc) {
    docs.push(doc);
  });
  if ((typeof docs[0] === 'string') && (meta != null)) {
    docs.unshift(meta);
  }
  return docs;
};
