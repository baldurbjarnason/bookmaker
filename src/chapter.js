'use strict';
var $, Assets, Chapter, addToZip, env, handlebars, hljs, marked, nunjucks, path, toHtml, typogr, utilities,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = require('jquery');

Assets = require('./assets');

handlebars = require('handlebars');

path = require('path');

utilities = require('./utilities');

addToZip = utilities.addToZip;

typogr = require('typogr');

nunjucks = require('nunjucks');

env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), {
  autoescape: false
});

marked = require('marked');

hljs = require('highlight.js');

marked.setOptions({
  highlight: function(code, lang) {
    return hljs.highlightAuto(lang, code).value;
  },
  langPrefix: 'language-'
});

Chapter = (function() {
  function Chapter(doc) {
    this.context = __bind(this.context, this);
    var key, _i, _len, _ref;

    _ref = Object.keys(doc);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      this[key] = doc[key];
    }
  }

  Chapter.prototype.context = function(book, options) {
    var chapter, _ref;

    book = book || this.book;
    chapter = Object.create(this);
    chapter.book = book;
    if (!this.meta) {
      chapter.meta = book.meta;
    }
    if (!this.assets) {
      chapter.assets = book.assets;
    }
    if (!this.chapters) {
      chapter.chapters = book.chapters;
    }
    chapter.relative = utilities.relative;
    chapter.links = utilities.pageLinks(chapter, this.book);
    if (!(options != null ? options.noJs : void 0)) {
      if (book.meta.specifiedJs && this.js) {
        chapter.scripted = true;
      } else if ((_ref = book.assets) != null ? _ref.js : void 0) {
        chapter.scripted = true;
      }
    }
    return chapter;
  };

  Chapter.prototype.formatPath = function(type) {
    var newpath;

    newpath = path.dirname(this.filename) + "/" + path.basename(this.filename, path.extname(this.filename)) + '.' + type;
    return newpath;
  };

  Chapter.prototype.addToZip = function(zip, template, callback) {
    var context;

    if (!template) {
      template = env.getTemplate('chapter.xhtml');
    }
    if (!this.assets) {
      context = this.context();
    } else {
      context = this;
    }
    return addToZip(zip, this.filename, template.render.bind(template, context), callback);
  };

  return Chapter;

})();

toHtml = Chapter.prototype.toHtml = function() {
  var bodytemplate;

  switch (this.type) {
    case 'md':
      return this.processHTML(typogr.typogrify(marked(this.body)));
    case 'html':
      return this.processHTML(typogr.typogrify(this.body));
    case 'hbs':
      bodytemplate = handlebars.compile(this.body);
      return this.processHTML(typogr.typogrify(bodytemplate(this.context())));
    case 'xhtml':
      return this.body;
  }
};

Object.defineProperty(Chapter.prototype, 'html', {
  get: toHtml,
  enumerable: true
});

Chapter.prototype.processHTML = function(html) {
  var addId, counter, elem, elements, nbsp, _counter, _i, _len;

  $('body').html(html);
  $('p').not('p+p').addClass('noindent');
  $('img').addClass('bookmaker-respect');
  $('pre code').each(function(i, e) {
    return hljs.highlightBlock(e);
  });
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
  elements = ['p', 'img', 'h1', 'h2', 'h3', 'h4', 'div', 'blockquote', 'ul', 'ol', 'nav', 'li', 'a', 'figure', 'figcaption', 'pre', 'code'];
  for (_i = 0, _len = elements.length; _i < _len; _i++) {
    elem = elements[_i];
    $(elem).each(function(index) {
      return addId(this, elem);
    });
  }
  nbsp = new RegExp('&nbsp;', 'g');
  return $('body').html().replace(nbsp, '&#160;');
};

Chapter.prototype.renderHtml = function(resolver) {
  return resolver.resolve(this.html);
};

module.exports = Chapter;
