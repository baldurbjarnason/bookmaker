var Assets, Book, Chapter, crypto, epub, fromEpub, fs, logger, path, toEpub;

Book = require('./book').Book;

Assets = require('./assets');

Chapter = require('./chapter');

logger = require('./logger');

fs = require('fs');

path = require('path');

crypto = require('crypto');

epub = require('./epub');

epub.extend(Book, Assets);

require('./exporters').extend(Chapter, Book, Assets);

require('./loaders').extend(Book);

require('./epubloader').extend(Book);

Book.Assets = Assets;

Book.Chapter = Chapter;

fromEpub = function(epubPath, callback) {
  var tempdir, temppath;

  temppath = path.resolve(os.tmpDir(), 'bm' + crypto.randomBytes(4).toString('hex'));
  tempdir = fs.mkdirSync(temppath);
  return Book.fromEpub(epubPath, temppath, function(err, book) {
    if (err) {
      logger.log.error(err);
      return callback(err);
    } else {
      book.assets.initSync();
      return callback(null, book);
    }
  });
};

toEpub = function(book, out, options, callback) {
  if (typeof options === 'function') {
    callback = options;
  }
  return book.toEpub(out, options, callback);
};

module.exports = {
  Book: Book,
  Assets: Assets,
  Chapter: Chapter,
  logger: logger,
  addTemplatePath: epub.addTemplatePath,
  getTemplateEnvironment: epub.getTemplateEnvironment,
  fromEpub: fromEpub,
  toEpub: toEpub
};
