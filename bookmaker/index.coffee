Book = require('./book').Book
SubOutline = require('./book').SubOutline
Assets = require './assets'
Chapter = require './chapter'


require('./epub').extend(Chapter, Book, Assets)
require('./loaders').extend(Book)

module.exports = {
  Book: Book
  SubOutline: SubOutline
  Assets: Assets
  Chapter: Chapter
}