'use strict';
var crypto, fs, mangle, mangler, path;

fs = require('fs');

path = require('path');

crypto = require('crypto');

mangler = function(fontpath, id) {
  var blob, font, font2, fontsum, fontsum2, i, key, prefix, shasum, _fn, _i, _len;

  font = fs.readFileSync(fontpath);
  shasum = crypto.createHash('sha1');
  fontsum = crypto.createHash('sha1').update(font).digest('hex');
  shasum.update(id.trim(), 'utf8');
  key = new Buffer(shasum.digest('hex'), 'hex');
  prefix = font.slice(0, 1040);
  _fn = function(blob, i) {
    return prefix[i] = blob ^ key[i % key.length];
  };
  for (i = _i = 0, _len = prefix.length; _i < _len; i = ++_i) {
    blob = prefix[i];
    _fn(blob, i);
  }
  font2 = Buffer.concat([prefix, font.slice(1040)]);
  fontsum2 = crypto.createHash('sha1').update(font2).digest('hex');
  if (fontsum === fontsum2) {
    console.log('fonts are identical');
  }
  fs.writeFileSync(fontpath, font2);
};

mangle = function(font, id, encoding) {
  var blob, font2, fontsum, fontsum2, i, key, prefix, shasum, _fn, _i, _len;

  shasum = crypto.createHash('sha1');
  fontsum = crypto.createHash('sha1').update(font).digest('hex');
  shasum.update(id.trim(), 'utf8');
  key = new Buffer(shasum.digest('hex'), 'hex');
  prefix = font.slice(0, 1040);
  _fn = function(blob, i) {
    return prefix[i] = blob ^ key[i % key.length];
  };
  for (i = _i = 0, _len = prefix.length; _i < _len; i = ++_i) {
    blob = prefix[i];
    _fn(blob, i);
  }
  font2 = Buffer.concat([prefix, font.slice(1040)]);
  fontsum2 = crypto.createHash('sha1').update(font2).digest('hex');
  if (fontsum === fontsum2) {
    console.log('fonts are identical');
  }
  if (encoding) {
    return font2.toString(encoding);
  } else {
    return font2;
  }
};

module.exports = {
  mangler: mangler,
  mangle: mangle
};
