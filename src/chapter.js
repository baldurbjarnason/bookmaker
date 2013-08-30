'use strict';
var $, Assets, Chapter, addToZip, env, handlebars, mdparser, nunjucks, path, renderer, rs, toHtml, utilities,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

rs = require('robotskirt');

renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML]);

mdparser = new rs.Markdown(renderer, [rs.EXT_TABLES]);

$ = require('jquery');

Assets = require('./assets');

handlebars = require('handlebars');

path = require('path');

utilities = require('./utilities');

addToZip = utilities.addToZip;

nunjucks = require('nunjucks');

env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), {
  autoescape: false
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

  Chapter.prototype.context = function(book) {
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
    if (book.meta.specifiedJs && this.js) {
      chapter.scripted = true;
    } else if ((_ref = book.assets) != null ? _ref.js : void 0) {
      chapter.scripted = true;
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
  var bodytemplate, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;

  switch (this.type) {
    case 'md':
      return this.processHTML(mdparser.render(this.body, (_ref = this.book) != null ? (_ref1 = _ref.meta) != null ? _ref1.smartyPants : void 0 : void 0));
    case 'html':
      return this.processHTML(this.body, (_ref2 = this.book) != null ? (_ref3 = _ref2.meta) != null ? _ref3.smartyPants : void 0 : void 0);
    case 'hbs':
      bodytemplate = handlebars.compile(this.body);
      return this.processHTML(bodytemplate(this.context()), (_ref4 = this.book) != null ? (_ref5 = _ref4.meta) != null ? _ref5.smartyPants : void 0 : void 0);
    case 'xhtml':
      return this.body;
  }
};

Object.defineProperty(Chapter.prototype, 'html', {
  get: toHtml,
  enumerable: true
});

Chapter.prototype.processHTML = function(html, smartyPants) {
  var addId, counter, elem, elements, nbsp, _counter, _i, _len;

  if (smartyPants === true) {
    html = rs.smartypantsHtml(html);
  }
  $('body').html(html);
  $('p').not('p+p').addClass('noindent');
  $('img').addClass('bookmaker-respect');
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
  return $('body').html().replace(nbsp, '&#160;');
};

Chapter.prototype.renderHtml = function(resolver) {
  return resolver.resolve(this.html);
};

module.exports = Chapter;
