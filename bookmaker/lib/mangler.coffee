'use strict'

fs = require('fs')
path = require('path')
crypto = require('crypto')

mangler = (fontpath, id) ->
  font = fs.readFileSync fontpath
  shasum = crypto.createHash('sha1')
  fontsum = crypto.createHash('sha1').update(font).digest('hex')
  shasum.update(id.trim(), 'utf8')
  key = new Buffer(shasum.digest('hex'), 'hex')
  prefix = font.slice(0,1040)
  for blob, i in prefix
    do (blob, i) ->
      prefix[i] = blob ^ (key[i % key.length])
  font2 = Buffer.concat([prefix, font.slice(1040)])
  fontsum2 = crypto.createHash('sha1').update(font2).digest('hex')
  if fontsum is fontsum2
    console.log 'fonts are identical'
  fs.writeFileSync fontpath, font2
  return

mangle = (font, id, encoding) ->
  shasum = crypto.createHash('sha1')
  fontsum = crypto.createHash('sha1').update(font).digest('hex')
  shasum.update(id.trim(), 'utf8')
  key = new Buffer(shasum.digest('hex'), 'hex')
  prefix = font.slice(0,1040)
  for blob, i in prefix
    do (blob, i) ->
      prefix[i] = blob ^ (key[i % key.length])
  font2 = Buffer.concat([prefix, font.slice(1040)])
  fontsum2 = crypto.createHash('sha1').update(font2).digest('hex')
  if fontsum is fontsum2
    console.log 'fonts are identical'
  if encoding
    return font2.toString(encoding)
  else
    return font2

module.exports =
  mangler: mangler
  mangle: mangle