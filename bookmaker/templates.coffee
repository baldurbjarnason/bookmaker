'use strict'

handlebars = require('handlebars')
path = require('path')
fs = require 'fs'
glob = require 'glob'

templates = {}
loadTemplates = (searchpath) ->
  newtemplates = glob.sync(searchpath)
  for temppath in newtemplates
    name = path.basename temppath, path.extname temppath
    template = fs.readFileSync temppath, 'utf8'
    templates[name] = handlebars.compile template
loadTemplates(path.resolve __filename, '../../', 'templates/**/*.hbs')
loadTemplates('templates/**/*.hbs')

module.exports = {
  templates: templates
  loadTemplates: loadTemplates
}