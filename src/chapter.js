'use strict';
var $, Assets, Chapter, handlebars, mdparser, path, processHTML, renderer, rs, toHtml, whenjs, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

rs = require('robotskirt');

renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);

mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES]);

$ = require('jquery');

Assets = require('./assets');

_ = require('underscore');

handlebars = require('handlebars');

whenjs = require('when');

path = require('path');

Chapter = (function() {
  function Chapter(doc) {
    this.context = __bind(this.context, this);    _.extend(this, doc);
  }

  Chapter.prototype.context = function() {
    if (!this.meta) {
      this.meta = this.book.meta;
    }
    if (!this.assets) {
      this.assets = this.book.assets;
    }
    if (!this.chapters) {
      this.chapters = this.book.chapters;
    }
    return this;
  };

  Chapter.prototype.formatPath = function(type) {
    var newpath;

    newpath = path.dirname(this.filename) + "/" + path.basename(this.filename, path.extname(this.filename)) + '.' + type;
    return newpath;
  };

  Chapter.prototype.toHal = function() {
    var banned, hal, href, selfindex, selfpath, tocpath, _ref;

    banned = ['book', 'meta', 'assets', 'chapters', 'html', 'context', 'epubManifest', 'epubSpine', 'navList', 'epubNCX'].concat(_.methods(this));
    hal = _.omit(this, banned);
    hal.body = this.html;
    hal.type = 'html';
    tocpath = path.relative(path.resolve("/", path.dirname(this.filename)), "/index.json");
    selfpath = this.formatPath('json');
    hal._links = {
      toc: {
        href: tocpath,
        name: 'JSON'
      },
      self: {
        href: selfpath
      }
    };
    if ((_ref = this.book.assets) != null ? _ref.css : void 0) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.book.assets.css;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          href = _ref1[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    }
    if (this.js) {
      hal._links.stylesheets = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.js;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          href = _ref1[_i];
          _results.push({
            href: href
          });
        }
        return _results;
      }).call(this);
    }
    selfindex = this.book.chapters.indexOf(this);
    if (selfindex !== 0) {
      hal._links.prev = {
        href: this.books.chapters[selfindex - 1].formatPath()
      };
    }
    if (selfindex !== this.book.chapters.length - 1) {
      hal._links.next = {
        href: this.books.chapters[selfindex + 1].formatPath()
      };
    }
    return hal;
  };

  Chapter.prototype.toJSON = function() {
    var filter, json, stringified;

    json = this.toHal();
    filter = function(key, value) {
      var subChapter, subChapters, _i, _len, _ref;

      if (key === "") {
        return value;
      }
      if (key === 'subChapters') {
        subChapters = [];
        _ref = subChapters.chapters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subChapter = _ref[_i];
          subChapters.push(subChapter);
        }
        return subChapters;
      }
      if (key === 'date') {
        return date.date.toString();
      }
      if (key === 'toJSON') {
        return "";
      }
      return value;
    };
    stringified = JSON.stringify(json, filter, 2);
    return stringified;
  };

  return Chapter;

})();

toHtml = function() {
  var bodytemplate;

  switch (this.type) {
    case 'md':
      return processHTML(mdparser.render(this.body));
    case 'html':
      return processHTML(this.body);
    case 'hbs':
      bodytemplate = handlebars.compile(this.body);
      return processHTML(bodytemplate(this.context()));
    case 'xhtml':
      return this.body;
  }
};

Object.defineProperty(Chapter.prototype, 'html', {
  get: toHtml,
  enumerable: true
});

processHTML = function(html) {
  var addId, counter, elem, elements, nbsp, _counter, _i, _len;

  $('body').html(html);
  $('p').not('p+p').addClass('noindent');
  _counter = {};
  counter = function(elem) {
    if (!_counter[elem]) {
      _counter[elem] = 0;
    }
    _counter[elem] += 1;
    return _counter[elem];
  };
  addId = function(el, elem) {
    if (!el.id) {
      return el.id = elem + '-' + counter(elem);
    }
  };
  elements = ['p', 'img', 'h1', 'h2', 'h3', 'h4', 'div', 'blockquote', 'ul', 'ol', 'nav', 'li', 'a'];
  for (_i = 0, _len = elements.length; _i < _len; _i++) {
    elem = elements[_i];
    $(elem).each(function(index) {
      return addId(this, elem);
    });
  }
  nbsp = new RegExp('&nbsp;', 'g');
  return rs.smartypantsHtml($('body').html().replace(nbsp, '&#160;'));
};

Chapter.prototype.htmlPromise = function() {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  this.renderHtml(deferred.resolver);
  return promise;
};

Chapter.prototype.renderHtml = function(resolver) {
  return resolver.resolve(this.html);
};

module.exports = Chapter;
