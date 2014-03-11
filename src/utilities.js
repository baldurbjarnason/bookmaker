'use strict';
var addStoredToZip, addToZip, bookLinks, chapterLinks, countergen, ensuredir, fs, idGen, idre, jsonClone, logger, mixin, mkdirp, pageLinks, path, relative, write,
  __slice = [].slice;

path = require('path');

fs = require('fs');

mkdirp = require('mkdirp');

logger = require('./logger');

relative = function(current, target) {
  var absolutecurrent, absolutetarget, relativetarget;
  if (!current) {
    current = "/";
  }
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
      link.href = value.href;
      _results.push(link.type = value.type);
    }
    return _results;
  })();
  if (book.meta.cover) {
    if (path.extname(book.meta.cover) === '.jpg') {
      type = 'image/jpeg';
    }
    if (path.extname(book.meta.cover) === '.jpeg') {
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

ensuredir = function(directory, callback) {
  return mkdirp(directory, callback);
};

write = function(filename, data, callback) {
  var container;
  container = path.dirname(filename);
  mkdirp.sync(container);
  return fs.writeFile(filename, data, function(err) {
    if (err) {
      logger.log.error(err);
      return callback(err);
    } else {
      logger.log.info("" + filename + " written");
      return callback();
    }
  });
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

addToZip = function(zip, fn, file, callback, store) {
  var options, resolver;
  options = {
    name: fn
  };
  resolver = function() {
    logger.log.info("" + fn + " written to zip");
    return callback();
  };
  if (store) {
    options.store = store;
  }
  if (typeof file === 'function') {
    return zip.addFile(file(), options, resolver);
  } else {
    return zip.addFile(file, options, resolver);
  }
};

addStoredToZip = function(zip, fn, file, callback) {
  var options, resolver;
  options = {
    name: fn
  };
  resolver = function() {
    logger.log.info("" + fn + " written to zip");
    return callback();
  };
  options.store = true;
  if (typeof file === 'function') {
    return zip.addFile(file(), options, resolver);
  } else {
    return zip.addFile(file, options, resolver);
  }
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

jsonClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
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
  addStoredToZip: addStoredToZip,
  countergen: countergen,
  idGen: idGen,
  jsonClone: jsonClone
};
