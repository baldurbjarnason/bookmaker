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
