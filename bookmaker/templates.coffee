'use strict'

path = require('path')
swig = require 'swig'

swig.init { allowErrors: true, autoescape: false, root: path.resolve __filename, '../../', 'templates/' }

templates = {}

loadTemplates = (searchpath) ->
  newtemplates = [
    'chapter.xhtml',
    'chapter.html',
    'cover.xhtml',
    'cover.html',
    'index.xhtml',
    'index.html',
    'chapter.xhtml',
    'toc.ncx',
    'content.opf',
    'encryption.xml']
  for temppath in newtemplates
    name = path.basename temppath
    templates[name] = swig.compileFile temppath
loadTemplates()

module.exports = {
  templates: templates
  loadTemplates: loadTemplates
}