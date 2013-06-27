'use strict'

path = require('path')
fs = require 'fs'
whenjs = require 'when'
mkdirp = require 'mkdirp'
_ = require 'underscore'
log = require('./logger').logger


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

ensuredir = (directory) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  mkdirp(directory, (err) ->
    if err
      deferred.reject(err)
    else
      deferred.resolve())
  return promise


write = (filename, data) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  fs.writeFile(filename, data, (err) ->
    if err
      deferred.reject(err)
    else
      log.info "#{filename} written"
      deferred.resolve())
  return promise

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

addToZip = (zip, fn, file, store) ->
  deferred = whenjs.defer()
  promise = deferred.promise
  options = { name: fn }
  resolver = () ->
    log.info "#{fn} written to zip"
    deferred.resolve()
  if store
    options.store = store
  if typeof file is 'function'
    zip.addFile(file(), options, resolver)
  else
    zip.addFile(file, options, resolver)
  return promise

countergen = () ->
  _counter = {}
  return (namespace) ->
    unless _counter[namespace]
      _counter[namespace] = 0
    _counter[namespace]++
    return _counter[namespace]


module.exports = {
  relative: relative
  pageLinks: pageLinks
  bookLinks: bookLinks
  chapterLinks: chapterLinks
  ensuredir: ensuredir
  write: write
  mixin: mixin
  addToZip: addToZip
  countergen: countergen
}