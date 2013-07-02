'use strict';
var ensuredir, env, extend, extendAssets, extendBook, extendChapter, filter, handlebars, log, nodefn, nunjucks, path, relative, sequence, url, utilities, whenjs, write, _;

whenjs = require('when');

_ = require('underscore');

path = require('path');

sequence = require('when/sequence');

nodefn = require("when/node/function");

url = require('url');

handlebars = require('handlebars');

utilities = require('./utilities');

nunjucks = require('nunjucks');

log = require('./logger').logger;

env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), {
  autoescape: false
});

ensuredir = utilities.ensuredir;

write = utilities.write;

extend = function(Chapter, Book, Assets) {
  extendChapter(Chapter);
  extendBook(Book);
  return extendAssets(Assets);
};

filter = function(key, value) {
  if (key === "") {
    return value;
  }
  if (key === 'toJSON') {
    return "";
  }
  return value;
};

relative = function(current, target) {
  var absolutecurrent, absolutetarget, relativetarget;

  absolutecurrent = path.dirname(path.resolve("/", current));
  absolutetarget = path.resolve("/", target);
  relativetarget = path.relative(absolutecurrent, absolutetarget);
  return relativetarget;
};

extendChapter = function(Chapter) {
  Chapter.prototype.toHal = function() {
    var banned, hal, href, htmlpath, selfindex, selfpath, tocpath, urlgen, _ref, _ref1, _ref2, _ref3, _ref4;

    banned = ['links', 'book', 'meta', 'filename', 'assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this));
    hal = _.omit(this, banned);
    hal.body = this.html;
    hal.type = 'html';
    urlgen = this.book.uri.bind(this.book) || relative;
    tocpath = path.relative(path.resolve("/", path.dirname(this.filename)), "/index.json");
    selfpath = ((_ref = this.book._state) != null ? _ref.baseurl : void 0) ? url.resolve(this.book._state.baseurl, this.formatPath('json')) : path.basename(this.formatPath('json'));
    if (!hal._links) {
      hal._links = {};
    }
    hal._links.toc = {
      href: tocpath,
      name: 'TOC-JSON',
      type: "application/hal+json"
    };
    hal._links.self = {
      href: selfpath,
      type: "application/hal+json"
    };
    if ((_ref1 = this.book._state) != null ? _ref1.htmlAndJson : void 0) {
      htmlpath = ((_ref2 = this.book._state) != null ? _ref2.baseurl : void 0) ? url.resolve(this.book._state.baseurl, this.formatPath('html')) : path.basename(this.formatPath('html'));
      hal._links.alternate = {
        href: htmlpath,
        type: this.book._state.htmltype
      };
    }
    if (((_ref3 = this.book.assets) != null ? _ref3.css : void 0) && !this.book.meta.specifiedCss) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref4, _results;

        _ref4 = this.book.assets.css;
        _results = [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          href = _ref4[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "text/css"
          });
        }
        return _results;
      }).call(this);
    } else if (this.css) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref4, _results;

        _ref4 = this.css;
        _results = [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          href = _ref4[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "text/css"
          });
        }
        return _results;
      }).call(this);
    }
    if (((_ref4 = this.book.assets) != null ? _ref4.js : void 0) && !this.book.meta.specifiedJs) {
      hal._links.javascript = (function() {
        var _i, _len, _ref5, _results;

        _ref5 = this.book.assets.js;
        _results = [];
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          href = _ref5[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "application/javascript"
          });
        }
        return _results;
      }).call(this);
    } else if (this.js) {
      hal._links.javascript = (function() {
        var _i, _len, _ref5, _results;

        _ref5 = this.js;
        _results = [];
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          href = _ref5[_i];
          _results.push({
            href: urlgen(this.filename, href),
            type: "application/javascript"
          });
        }
        return _results;
      }).call(this);
    }
    selfindex = this.book.chapters.indexOf(this);
    if (selfindex !== -1) {
      if (selfindex !== 0) {
        hal._links.prev = {
          href: urlgen(this.filename, this.book.chapters[selfindex - 1].formatPath('json')),
          type: "application/hal+json"
        };
      }
      if (selfindex !== this.book.chapters.length - 1) {
        hal._links.next = {
          href: urlgen(this.filename, this.book.chapters[selfindex + 1].formatPath('json')),
          type: "application/hal+json"
        };
      }
    }
    return hal;
  };
  Chapter.prototype.toJSON = function() {
    var hal;

    hal = this.toHal();
    return JSON.stringify(hal, filter, 2);
  };
  return Chapter;
};

extendAssets = function(Assets) {
  return Assets;
};

extendBook = function(Book) {
  Book.prototype.uri = function(current, target) {
    var _ref;

    if ((_ref = this._state) != null ? _ref.baseurl : void 0) {
      return url.resolve(this._state.baseurl, target);
    } else {
      return this.relative(current, target);
    }
  };
  Book.prototype.toHal = function(options) {
    var chapter, covertype, hal, href, image, selfpath, stylesheet, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;

    hal = {};
    _.extend(hal, this.meta);
    if (!this._state) {
      this._state = {};
    }
    if (options != null ? options.baseurl : void 0) {
      selfpath = options.baseurl + 'index.json';
      this._state.baseurl = options.baseurl;
    } else if (this.baseurl) {
      this._state.baseurl = this.baseurl;
      selfpath = options.baseurl + 'index.json';
    } else {
      selfpath = 'index.json';
    }
    if (!hal._links) {
      hal._links = {};
    }
    hal._links.self = {
      href: selfpath,
      type: "application/hal+json",
      hreflang: this.meta.lang,
      title: this.title
    };
    if (path.extname(this.meta.cover) === '.jpg') {
      covertype = 'image/jpeg';
    }
    if (path.extname(this.meta.cover) === '.png') {
      covertype = 'image/png';
    }
    if (path.extname(this.meta.cover) === '.svg') {
      covertype = 'image/svg+xml';
    }
    hal._links.cover = [
      {
        href: this.uri('index.json', this.meta.cover),
        type: covertype,
        title: 'Cover Image'
      }
    ];
    if (this.meta.start) {
      hal._links.start = {
        href: this.uri('index.json', this.meta.start.formatPath('json')),
        type: "application/hal+json"
      };
    }
    if ((_ref = this._state) != null ? _ref.htmlAndJson : void 0) {
      hal._links.alternate = {
        href: this.uri('index.json', 'index.html'),
        type: this._state.htmltype,
        title: "HTML Table of Contents"
      };
    }
    if (!(options != null ? options.embedChapters : void 0)) {
      hal._links.chapters = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.chapters;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          chapter = _ref1[_i];
          _results.push({
            href: this.uri('index.json', chapter.formatPath('json')),
            type: "application/hal+json",
            hreflang: this.meta.lang,
            title: chapter.title
          });
        }
        return _results;
      }).call(this);
    } else {
      hal._links.chapters = this.chapters;
    }
    hal._links.images = [];
    _ref1 = this.assets.png;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      image = _ref1[_i];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/png"
      });
    }
    _ref2 = this.assets.jpg;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      image = _ref2[_j];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/jpeg"
      });
    }
    _ref3 = this.assets.gif;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      image = _ref3[_k];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/gif"
      });
    }
    _ref4 = this.assets.svg;
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
      image = _ref4[_l];
      hal._links.images.push({
        href: this.uri('index.json', image),
        type: "image/svg+xml"
      });
    }
    hal._links.stylesheets = (function() {
      var _len4, _m, _ref5, _results;

      _ref5 = this.assets.css;
      _results = [];
      for (_m = 0, _len4 = _ref5.length; _m < _len4; _m++) {
        stylesheet = _ref5[_m];
        _results.push({
          href: this.uri('index.json', stylesheet),
          type: "text/css"
        });
      }
      return _results;
    }).call(this);
    hal._links.javascript = (function() {
      var _len4, _m, _ref5, _results;

      _ref5 = this.assets.js;
      _results = [];
      for (_m = 0, _len4 = _ref5.length; _m < _len4; _m++) {
        href = _ref5[_m];
        _results.push({
          href: this.uri('index.json', href),
          type: "application/javascript"
        });
      }
      return _results;
    }).call(this);
    hal.date = this.meta.date.isoDate;
    delete hal.cover;
    delete hal.start;
    hal.modified = this.meta.modified.isoDate;
    return hal;
  };
  Book.prototype.toJSON = function(options) {
    var hal;

    hal = this.toHal(options);
    return JSON.stringify(hal, filter, 2);
  };
  Book.prototype.toJsonFiles = function(directory, options) {
    var chapter, context, hal, json, selfindex, tasks, _i, _len, _ref;

    hal = this.toHal(options);
    hal.assetsPath = this.assets.assetsPath;
    json = JSON.stringify(hal, filter, 2);
    tasks = [];
    if (directory) {
      tasks.push(ensuredir(directory));
    } else {
      directory = directory || process.cwd();
    }
    tasks.push(ensuredir(directory + 'chapters/'));
    if (!(options != null ? options.noAssets : void 0)) {
      tasks.push(this.assets.copy(directory + hal.assetsPath));
    }
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      selfindex = this.chapters.indexOf(chapter);
      context = chapter.context(this);
      if (selfindex !== -1) {
        if (selfindex !== 0) {
          if (!context._links) {
            context._links = {};
          }
          context._links.prev = {
            href: this.uri(chapter.filename, this.chapters[selfindex - 1].formatPath('json')),
            type: "application/hal+json"
          };
        }
        if (selfindex !== this.chapters.length - 1) {
          if (!context._links) {
            context._links = {};
          }
          context._links.next = {
            href: this.uri(chapter.filename, this.chapters[selfindex + 1].formatPath('json')),
            type: "application/hal+json"
          };
        }
      }
      tasks.push(write(directory + chapter.formatPath('json'), context.toJSON(), 'utf8'));
    }
    tasks.push(write(directory + 'index.json', json, 'utf8'));
    return whenjs.all(tasks);
  };
  Book.prototype.toHtmlFiles = function(directory, options) {
    var book, chapter, context, jsonpath, selfindex, selfpath, tasks, _i, _len, _ref, _ref1, _ref2, _ref3;

    log.info("Writing HTML files");
    book = Object.create(this);
    if (!book._state) {
      book._state = {};
    }
    book._state.htmltype = "text/html";
    book.filename = 'index.html';
    if (options != null ? options.baseurl : void 0) {
      selfpath = options.baseurl + 'index.html';
      book._state.baseurl = options.baseurl;
    } else if (this.baseurl) {
      book._state.baseurl = this.baseurl;
    } else {
      selfpath = 'index.html';
    }
    if ((_ref = book._state) != null ? _ref.htmlAndJson : void 0) {
      if (!book._links) {
        book._links = {};
      }
      book._links.alternate = {
        href: book.uri('index.html', 'index.json'),
        type: "application/hal+json",
        title: "JSON Table of Contents"
      };
    }
    book.links = utilities.pageLinks(book, book);
    tasks = [];
    if (directory) {
      tasks.push(ensuredir(directory));
    } else {
      directory = directory || process.cwd();
    }
    tasks.push(ensuredir(directory + 'chapters/'));
    if (!(options != null ? options.noAssets : void 0)) {
      tasks.push(book.assets.copy(directory + book.assets.assetsPath));
    }
    tasks.push(write(directory + 'index.html', env.getTemplate('index.html').render(book), 'utf8'));
    tasks.push(write(directory + 'cover.html', env.getTemplate('cover.html').render(book), 'utf8'));
    _ref1 = book.chapters;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      chapter = _ref1[_i];
      log.info("Preparing " + chapter.filename);
      context = chapter.context(book);
      selfindex = book.chapters.indexOf(chapter);
      if (!context._links) {
        context._links = {};
      }
      if (selfindex !== -1) {
        if (selfindex !== 0) {
          context._links.prev = {
            href: book.uri(chapter.filename, book.chapters[selfindex - 1].formatPath('html')),
            type: book._state.htmltype
          };
        }
        if (selfindex !== this.chapters.length - 1) {
          context._links.next = {
            href: book.uri(chapter.filename, book.chapters[selfindex + 1].formatPath('html')),
            type: book._state.htmltype
          };
        }
      }
      if ((_ref2 = book._state) != null ? _ref2.htmlAndJson : void 0) {
        jsonpath = ((_ref3 = book._state) != null ? _ref3.baseurl : void 0) ? book.uri(context.filename, context.formatPath('json')) : path.basename(context.formatPath('json'));
        context._links.alternate = {
          href: jsonpath,
          type: "application/hal+json"
        };
        context.links = utilities.pageLinks(context, book);
      }
      tasks.push(write(directory + chapter.filename, env.getTemplate('chapter.html').render(context), 'utf8'));
    }
    return whenjs.all(tasks);
  };
  Book.prototype.toHtmlAndJsonFiles = function(directory, options) {
    var book, defaults;

    defaults = {
      arbitraryDefault: true
    };
    options = _.extend(defaults, options);
    book = Object.create(this);
    book._state = {};
    book._state.htmlAndJson = true;
    book._state.htmltype = "text/html";
    return book.toHtmlFiles(directory, options).then(function() {
      options.noAssets = true;
      return book.toJsonFiles(directory, options);
    });
  };
  return Book;
};

module.exports = {
  extend: extend
};
