Book = require('./book').Book
Assets = require './assets'
Chapter = require './chapter'
logger = require './logger'
fs = require 'fs'
path = require 'path'
crypto = require 'crypto'


epub = require('./epub')
epub.extend(Book, Assets)
require('./exporters').extend(Chapter, Book, Assets)
require('./loaders').extend(Book)
require('./epubloader').extend(Book)

Book.Assets = Assets
Book.Chapter = Chapter

fromEpub = (epubPath, callback) ->
  temppath = path.resolve(os.tmpDir(), 'bm' + crypto.randomBytes(4).toString('hex'))
  tempdir = fs.mkdirSync(temppath)
  Book.fromEpub epubPath, temppath, (err, book) ->
    if err
      logger.log.error err
      callback err
    else
      book.assets.initSync()
      callback null, book

toEpub = (book, out, options, callback) ->
  if typeof options is 'function'
    callback = options
  book.toEpub out, options, callback



module.exports = {
  Book: Book
  Assets: Assets
  Chapter: Chapter
  logger: logger
  addTemplatePath: epub.addTemplatePath
  getTemplateEnvironment: epub.getTemplateEnvironment
  fromEpub: fromEpub
  toEpub: toEpub
}