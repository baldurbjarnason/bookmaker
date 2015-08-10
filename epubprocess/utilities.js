'use strict';
var bookmaker, buildBook, crypto, done, filesize, fs, glob, loadEpubTask, newBookSetup, os, path, rimraf, saveEpubTask, saveMeta, setup, winston, yaml, _;

os = require('os');

crypto = require('crypto');

rimraf = require('rimraf');

fs = require('fs');

bookmaker = require('..(/src/index)');

winston = require('winston');

glob = require('glob');

path = require('path');

filesize = require('filesize');

yaml = require('js-yaml');

_ = require('underscore');

newBookSetup = function(program) {
  return function(callback) {
    program.temppath = path.resolve(os.tmpDir(), 'bm' + crypto.randomBytes(4).toString('hex'));
    program.tempdir = fs.mkdirSync(program.temppath);
    return callback(null, program);
  };
};

done = function(program) {
  return function(written, callback) {
    var savings, savingsBits;
    console.log('Cleaning up.');
    if (program.epubsize) {
      savingsBits = parseInt(program.epubsize) - parseInt(written);
      console.log(savingsBits);
      savings = filesize(savingsBits, 2, false);
      console.log("" + savings + " saved");
      program.epubsize = {};
    }
    return rimraf(program.temppath, function(err) {
      if (err) {
        console.error(err);
        callback(err, written);
      }
      return callback(null, written);
    });
  };
};

setup = function(program, fileglob) {
  var newLogger;
  if (program.verbose) {
    newLogger = new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'verbose',
          colorize: 'true'
        })
      ]
    });
  } else {
    newLogger = new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'warn',
          colorize: 'true'
        })
      ]
    });
  }
  bookmaker.logger.replaceLogger(newLogger);
  if (fileglob) {
    program.files = glob.sync(fileglob);
  }
  return program;
};

loadEpubTask = function(epub) {
  return function(program, callback) {
    return bookmaker.Book.fromEpub(epub, program.temppath, callback);
  };
};

saveEpubTask = function(program, epub) {
  return function(book, callback) {
    var options, out, output;
    if (program.mangle) {
      options = {
        obfuscateFonts: true
      };
    }
    if (program.output) {
      output = program.output;
    } else {
      output = path.basename(epub, '.epub') + '-processed.epub';
    }
    if (program.folder) {
      out = fs.createWriteStream(path.join(program.folder, output));
    } else {
      out = fs.createWriteStream(output);
    }
    return book.toEpub(out, options, callback);
  };
};

buildBook = function(chapterFolder, bookoutline, assetspath, callback) {
  var assets, basepath, book, booktxt, directory, doc, docs, emptyline, file, filename, list, mdchaptergen, meta, titlecounter, titlere, type, _i, _len;
  directory = process.cwd();
  titlecounter = 0;
  titlere = new RegExp('^# (.+)', 'm');
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
  if (fs.existsSync(path.join(directory, 'meta.yaml'))) {
    meta = yaml.safeLoad(fs.readFileSync(path.join(directory, 'meta.yaml'), 'utf8'));
  } else {
    meta = {};
  }
  assets = new bookmaker.Assets(directory, assetspath);
  book = new bookmaker.Book(meta, assets);
  if (!book.meta.cover) {
    book.meta.cover = path.join(assetspath, 'cover.jpg');
  }
  if (fs.existsSync(path.join(directory, bookoutline))) {
    booktxt = fs.readFileSync(path.join(directory, bookoutline), 'utf8');
  }
  list = booktxt.trim().split(/\n/);
  emptyline = /^\s$/;
  for (_i = 0, _len = list.length; _i < _len; _i++) {
    filename = list[_i];
    if ((filename[0] === '#') || (filename.match(emptyline))) {

    } else {
      filename = filename.trim();
      if (fs.existsSync(path.join(directory, chapterFolder, filename))) {
        file = fs.readFileSync(path.join(directory, chapterFolder, filename), 'utf8');
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
      book.addChapter(new bookmaker.Chapter(doc));
    }
  }
  return callback(null, book);
};

saveMeta = function(book, callback) {
  var meta;
  meta = _.clone(book.meta);
  meta.date = book.meta.date.date;
  meta.modified = "";
  fs.writeFileSync('meta.yaml', yaml.safeDump(meta));
  return callback(null, book);
};

module.exports = {
  newBookSetup: newBookSetup,
  buildBook: buildBook,
  saveMeta: saveMeta,
  done: done,
  setup: setup,
  saveEpubTask: saveEpubTask,
  loadEpubTask: loadEpubTask,
  logger: bookmaker.logger
};
