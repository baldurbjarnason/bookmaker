'use strict';
var loadTemplates, path, swig, templates;

path = require('path');

swig = require('swig');

swig.init({
  allowErrors: true,
  autoescape: false,
  root: path.resolve(__filename, '../../', 'templates/')
});

templates = {};

loadTemplates = function(searchpath) {
  var name, newtemplates, temppath, _i, _len, _results;

  newtemplates = ['chapter.xhtml', 'chapter.html', 'cover.xhtml', 'cover.html', 'index.xhtml', 'index.html', 'chapter.xhtml', 'toc.ncx', 'content.opf', 'encryption.xml'];
  _results = [];
  for (_i = 0, _len = newtemplates.length; _i < _len; _i++) {
    temppath = newtemplates[_i];
    name = path.basename(temppath);
    _results.push(templates[name] = swig.compileFile(temppath));
  }
  return _results;
};

loadTemplates();

module.exports = {
  templates: templates,
  loadTemplates: loadTemplates
};
