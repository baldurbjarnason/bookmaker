'use strict';
var fs, glob, handlebars, loadTemplates, path, templates;

handlebars = require('handlebars');

path = require('path');

fs = require('fs');

glob = require('glob');

templates = {};

loadTemplates = function(searchpath) {
  var name, newtemplates, template, temppath, _i, _len, _results;

  newtemplates = glob.sync(searchpath);
  _results = [];
  for (_i = 0, _len = newtemplates.length; _i < _len; _i++) {
    temppath = newtemplates[_i];
    name = path.basename(temppath, path.extname(temppath));
    template = fs.readFileSync(temppath, 'utf8');
    _results.push(templates[name] = handlebars.compile(template));
  }
  return _results;
};

loadTemplates(path.resolve(__filename, '../../', 'templates/**/*.hbs'));

loadTemplates('templates/**/*.hbs');

module.exports = {
  templates: templates,
  loadTemplates: loadTemplates
};
