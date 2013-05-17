Book = require('./book').Book
SubOutline = require('./book').SubOutline
Assets = require './assets'
Chapter = require './chapter'


require('./epub').extend(Chapter, Book, Assets)
require('./loaders').extend(Book)
yaml = require './yaml'
yaml.extend(Book)

module.exports = {
  Book: Book
  SubOutline: SubOutline
  Assets: Assets
  Chapter: Chapter
  loadYaml: yaml.loadYaml
  toYaml: (book, filename, options) ->
    book.toYaml(filename, options)
  toEpub: (book, out, options) ->
    book.toEpub(out, options)
}