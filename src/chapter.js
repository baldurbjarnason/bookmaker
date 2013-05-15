'use strict';
var $, Assets, Chapter, mdparser, processHTML, renderer, rs, toHtml, _;

rs = require('robotskirt');

renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);

mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES]);

$ = require('jquery');

Assets = require('./assets.coffee');

_ = require('underscore');

Chapter = (function() {
  var context;

  function Chapter(doc) {
    _.extend(this, doc);
  }

  context = function() {
    context = {
      meta: this.book.meta,
      assets: this.book.assets,
      outline: this.book.chapters
    };
    _.extend(context, this);
    return context;
  };

  return Chapter;

})();

Object.defineProperty(Chapter.prototype, 'html', {
  get: toHtml,
  enumerable: true
});

toHtml = function() {
  var bodytemplate;

  switch (this.type) {
    case 'md':
      return processHTML(mdparser.render(chapter.body));
    case 'html':
      return processHTML(chapter.body);
    case 'hbs':
      bodytemplate = handlebars.compile(chapter.body);
      return processHTML(bodytemplate(chapter.context()));
    case 'xhtml':
      return chapter.body;
  }
};

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
  return resolver.resolve(this.toHtml);
};

module.exports = Chapter;
