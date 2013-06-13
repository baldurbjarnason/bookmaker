Book = require('./book').Book
Assets = require './assets'
Chapter = require './chapter'


require('./epub').extend(Book, Assets)
require('./exporters').extend(Chapter, Book, Assets)
require('./loaders').extend(Book)
yaml = require './yaml'
yaml.extend(Book)

Book.Assets = Assets
Book.Chapter = Chapter

module.exports = {
  Book: Book
  Assets: Assets
  Chapter: Chapter
  loadYaml: yaml.loadYaml
  toYaml: (book, filename, options) ->
    book.toYaml(filename, options)
  toEpub: (book, out, options) ->
    book.toEpub(out, options)
}