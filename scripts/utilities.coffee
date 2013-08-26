'use strict'

path = require('path')
fs = require 'fs'
mkdirp = require 'mkdirp'
_ = require 'underscore'
logger = require('./logger')


relative = (current, target) ->
  absolutecurrent = path.dirname path.resolve("/", current)
  absolutetarget = path.resolve("/", target)
  relativetarget = path.relative(absolutecurrent, absolutetarget)
  return relativetarget

pageLinks = (page, book) ->
  links = for key, value of page._links
    link = {}
    link.rel = key
    _.extend link, value
  if book.meta.cover
    if path.extname(book.meta.cover) is '.jpg'
      type = 'image/jpeg'
    if path.extname(book.meta.cover) is '.jpeg'
      type = 'image/jpeg'
    if path.extname(book.meta.cover) is '.png'
      type = 'image/png'
    if path.extname(book.meta.cover) is '.svg'
      type = 'image/svg+xml'
    links.push({ rel: 'cover', href: relative(page.filename, book.meta.cover), type: type, title: 'Cover Image'})
    links.push({ rel: 'cover', href: relative(page.filename, 'cover.html'), type: book._state?.htmltype || "application/xhtml+xml", title: 'Cover Page'})
  if book
    links.push({ rel: 'contents', href: relative(page.filename, 'index.html'), type: book._state?.htmltype || "application/xhtml+xml", title: 'Table of Contents'})
  return links

bookLinks = () ->
  pageLinks(this, this)

chapterLinks = () ->
  pageLinks(this, @book)

ensuredir = (directory, callback) ->
  mkdirp(directory, callback)


write = (filename, data, callback) ->
  container = path.dirname(filename)
  mkdirp.sync container
  fs.writeFile(filename, data, (err) ->
    if err
      logger.log.error err
      callback(err)
    else
      logger.log.info "#{filename} written"
      callback())

mixin = (ReceivingClass, DonatingClasses...) ->
  donate = (DonatingClass) ->
    for key, value of DonatingClass.prototype
      unless ReceivingClass.prototype.hasOwnProperty(key)
        ReceivingClass.prototype[key] = DonatingClass.prototype[key]
    for key, value of DonatingClass
      unless ReceivingClass.hasOwnProperty(key)
        ReceivingClass[key] = DonatingClass[key]
  for donator in DonatingClasses
    donate(donator)
  return ReceivingClass

addToZip = (zip, fn, file, callback, store) ->
  options = { name: fn }
  resolver = () ->
    logger.log.info "#{fn} written to zip"
    callback()
  if store
    options.store = store
  if typeof file is 'function'
    zip.addFile(file(), options, resolver)
  else
    zip.addFile(file, options, resolver)

addStoredToZip = (zip, fn, file, callback) ->
  options = { name: fn }
  resolver = () ->
    logger.log.info "#{fn} written to zip"
    callback()
  options.store = true
  if typeof file is 'function'
    zip.addFile(file(), options, resolver)
  else
    zip.addFile(file, options, resolver)

countergen = () ->
  _counter = {}
  return (namespace) ->
    unless _counter[namespace]
      _counter[namespace] = 0
    _counter[namespace]++
    return _counter[namespace]

idre = new RegExp("[^A-Za-z0-9_\\.\\-\\:]", "g")
idGen = (fn) ->
  safe = fn.replace idre, ""
  return "id" + safe

module.exports = {
  relative: relative
  pageLinks: pageLinks
  bookLinks: bookLinks
  chapterLinks: chapterLinks
  ensuredir: ensuredir
  write: write
  mixin: mixin
  addToZip: addToZip
  addStoredToZip: addStoredToZip
  countergen: countergen
  idGen: idGen
}