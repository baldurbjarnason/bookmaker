'use strict';
var addToZip, bookLinks, chapterLinks, countergen, ensuredir, fs, idGen, idre, log, mixin, mkdirp, pageLinks, path, relative, whenjs, write, _,
  __slice = [].slice;

path = require('path');

fs = require('fs');

whenjs = require('when');

mkdirp = require('mkdirp');

_ = require('underscore');

log = require('./logger').logger;

relative = function(current, target) {
  var absolutecurrent, absolutetarget, relativetarget;

  absolutecurrent = path.dirname(path.resolve("/", current));
  absolutetarget = path.resolve("/", target);
  relativetarget = path.relative(absolutecurrent, absolutetarget);
  return relativetarget;
};

pageLinks = function(page, book) {
  var key, link, links, type, value, _ref, _ref1;

  links = (function() {
    var _ref, _results;

    _ref = page._links;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      link = {};
      link.rel = key;
      _results.push(_.extend(link, value));
    }
    return _results;
  })();
  if (book.meta.cover) {
    if (path.extname(book.meta.cover) === '.jpg') {
      type = 'image/jpeg';
    }
    if (path.extname(book.meta.cover) === '.png') {
      type = 'image/png';
    }
    if (path.extname(book.meta.cover) === '.svg') {
      type = 'image/svg+xml';
    }
    links.push({
      rel: 'cover',
      href: relative(page.filename, book.meta.cover),
      type: type,
      title: 'Cover Image'
    });
    links.push({
      rel: 'cover',
      href: relative(page.filename, 'cover.html'),
      type: ((_ref = book._state) != null ? _ref.htmltype : void 0) || "application/xhtml+xml",
      title: 'Cover Page'
    });
  }
  if (book) {
    links.push({
      rel: 'contents',
      href: relative(page.filename, 'index.html'),
      type: ((_ref1 = book._state) != null ? _ref1.htmltype : void 0) || "application/xhtml+xml",
      title: 'Table of Contents'
    });
  }
  return links;
};

bookLinks = function() {
  return pageLinks(this, this);
};

chapterLinks = function() {
  return pageLinks(this, this.book);
};

ensuredir = function(directory) {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  mkdirp(directory, function(err) {
    if (err) {
      log.error(err);
      return deferred.reject(err);
    } else {
      return deferred.resolve();
    }
  });
  return promise;
};

write = function(filename, data) {
  var container, deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  container = path.dirname(filename);
  mkdirp.sync(container);
  fs.writeFile(filename, data, function(err) {
    if (err) {
      log.error(err);
      return deferred.reject(err);
    } else {
      log.info("" + filename + " written");
      return deferred.resolve();
    }
  });
  return promise;
};

mixin = function() {
  var DonatingClasses, ReceivingClass, donate, donator, _i, _len;

  ReceivingClass = arguments[0], DonatingClasses = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  donate = function(DonatingClass) {
    var key, value, _ref, _results;

    _ref = DonatingClass.prototype;
    for (key in _ref) {
      value = _ref[key];
      if (!ReceivingClass.prototype.hasOwnProperty(key)) {
        ReceivingClass.prototype[key] = DonatingClass.prototype[key];
      }
    }
    _results = [];
    for (key in DonatingClass) {
      value = DonatingClass[key];
      if (!ReceivingClass.hasOwnProperty(key)) {
        _results.push(ReceivingClass[key] = DonatingClass[key]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  for (_i = 0, _len = DonatingClasses.length; _i < _len; _i++) {
    donator = DonatingClasses[_i];
    donate(donator);
  }
  return ReceivingClass;
};

addToZip = function(zip, fn, file, store) {
  var deferred, options, promise, resolver;

  deferred = whenjs.defer();
  promise = deferred.promise;
  options = {
    name: fn
  };
  resolver = function() {
    log.info("" + fn + " written to zip");
    return deferred.resolve();
  };
  if (store) {
    options.store = store;
  }
  if (typeof file === 'function') {
    zip.addFile(file(), options, resolver);
  } else {
    zip.addFile(file, options, resolver);
  }
  return promise;
};

countergen = function() {
  var _counter;

  _counter = {};
  return function(namespace) {
    if (!_counter[namespace]) {
      _counter[namespace] = 0;
    }
    _counter[namespace]++;
    return _counter[namespace];
  };
};

idre = new RegExp("[^A-Za-z0-9_\\.\\-\\:]", "g");

idGen = function(fn) {
  var safe;

  safe = fn.replace(idre, "");
  return "id" + safe;
};

module.exports = {
  relative: relative,
  pageLinks: pageLinks,
  bookLinks: bookLinks,
  chapterLinks: chapterLinks,
  ensuredir: ensuredir,
  write: write,
  mixin: mixin,
  addToZip: addToZip,
  countergen: countergen,
  idGen: idGen
};
