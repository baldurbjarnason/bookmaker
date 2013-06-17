'use strict';
var env, loadTemplates, nunjucks, path, templates;

path = require('path');

nunjucks = require('nunjucks');

env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), {
  autoescape: false
});

templates = {};

loadTemplates = function(searchpath) {
  var name, newtemplates, temppath, _i, _len, _results;

  newtemplates = ['chapter.xhtml', 'chapter.html', 'cover.xhtml', 'cover.html', 'index.xhtml', 'index.html', 'chapter.xhtml', 'toc.ncx', 'content.opf', 'encryption.xml'];
  _results = [];
  for (_i = 0, _len = newtemplates.length; _i < _len; _i++) {
    temppath = newtemplates[_i];
    name = path.basename(temppath);
    _results.push(templates[name] = env.getTemplate(temppath));
  }
  return _results;
};

loadTemplates();

module.exports = {
  templates: templates,
  loadTemplates: loadTemplates,
  env: env
};
