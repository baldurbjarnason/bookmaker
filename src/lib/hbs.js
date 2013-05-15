'use strict';
var html5, parser, path, register, serializeOpts;

path = require('path');

html5 = require('html5');

parser = new html5.Parser();

serializeOpts = {
  minimize_boolean_attributes: false,
  lowercase: true
};

register = function(Handlebars) {
  var chapterIndex, globalCounter, navPoint, processHTML, renderHtmlToc;

  chapterIndex = 1;
  navPoint = 1;
  globalCounter = 0;
  Handlebars.registerHelper('chapterIndex', function() {
    chapterIndex++;
    return chapterIndex;
  });
  Handlebars.registerHelper('navPoint', function() {
    navPoint++;
    return navPoint;
  });
  Handlebars.registerHelper('globalCounter', function() {
    var counter;

    globalCounter++;
    counter = "c" + globalCounter;
    return counter;
  });
  Handlebars.registerHelper('chapterId', function(filepath) {
    var chapterId;

    chapterId = 'chapter-' + path.basename(filepath, '.html');
    return chapterId;
  });
  Handlebars.registerHelper('basename', function(filename) {
    return path.basename(filename);
  });
  Handlebars.registerHelper('relative', function(current, filename) {
    if (current === filename) {
      return path.basename(filename);
    } else {
      return path.relative(path.dirname(path.resolve(current)), path.resolve(filename));
    }
  });
  renderHtmlToc = function(outline) {
    var doc, toc, _fn, _i, _len;

    toc = "";
    _fn = function(doc) {
      if (doc.toc != null) {
        return toc = "<reference type='toc' title='Contents' href='" + doc.filename + "'></reference>";
      }
    };
    for (_i = 0, _len = outline.length; _i < _len; _i++) {
      doc = outline[_i];
      _fn(doc);
    }
    return new Handlebars.SafeString(toc);
  };
  Handlebars.registerHelper('opftoc', renderHtmlToc);
  processHTML = function(html) {
    var counter, doc, elem, elements, firstp, readyHtml, _counter, _fn, _i, _len;

    parser.parse("<div class='chapter' id='chapter'>" + html + "</div>");
    doc = parser.tree.document;
    _counter = {};
    counter = function(elem) {
      if (!_counter[elem]) {
        _counter[elem] = 0;
      }
      _counter[elem] += 1;
      return _counter[elem];
    };
    firstp = parser.tree.document.getElementsByTagName('p')[0];
    if (firstp.className) {
      firstp.className = firstp.className + ' firstparagraph';
    } else {
      firstp.className = 'firstparagraph';
    }
    elements = ['p', 'img', 'h1', 'h2', 'h3', 'h4', 'div', 'blockquote', 'ul', 'ol', 'nav', 'li', 'a'];
    _fn = function(elem) {
      var el, elems, _j, _len1, _results;

      elems = doc.getElementsByTagName(elem);
      _results = [];
      for (_j = 0, _len1 = elems.length; _j < _len1; _j++) {
        el = elems[_j];
        _results.push((function(el) {
          if (!el.id) {
            return el.id = elem + '-' + counter(elem);
          }
        })(el));
      }
      return _results;
    };
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      elem = elements[_i];
      _fn(elem);
    }
    readyHtml = html5.serialize(parser.tree.document.getElementById('chapter'), null, serializeOpts);
    return new Handlebars.SafeString(readyHtml);
  };
  Handlebars.registerHelper('process', processHTML);
};

module.exports = {
  'register': register
};
