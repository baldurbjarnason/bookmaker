'use strict';
var addToZip, callbacks, chapterProperties, extendAssets, extendBook, fs, glob, isCover, mangler, pagelinks, path, processLandmarks, relative, renderEpub, sequence, temp, templates, toEpub, utilities, whenjs, zipStream, _;

zipStream = require('zipstream-contentment');

whenjs = require('when');

sequence = require('when/sequence');

callbacks = require('when/callbacks');

path = require('path');

glob = require('glob');

fs = require('fs');

mangler = require('./lib/mangler');

_ = require('underscore');

temp = require('./templates');

templates = temp.templates;

utilities = require('./utilities');

relative = utilities.relative;

pagelinks = utilities.pageLinks;

addToZip = utilities.addToZip;

extendBook = function(Book) {
  Book.prototype.toEpub = toEpub;
  return Book;
};

isCover = function(path) {
  if (this.meta.cover === path) {
    return ' properties="cover-image"';
  } else {
    return "";
  }
};

chapterProperties = function(chapter) {
  var prop, properties;

  properties = [];
  if (chapter.svg) {
    properties.push('svg');
  }
  if (chapter.js || (this.assets.js.toString() !== "" && !this.specifiedJs)) {
    properties.push('scripted');
  }
  prop = properties.join(' ');
  if (properties.toString() !== "") {
    return "properties='" + prop + "'";
  } else {
    return "";
  }
};

processLandmarks = function(landmarks) {
  var landmark;

  if (!landmarks) {
    return;
  }
  landmarks = (function() {
    var _i, _len, _results;

    _results = [];
    for (_i = 0, _len = landmarks.length; _i < _len; _i++) {
      landmark = landmarks[_i];
      _results.push((function(landmark) {
        if (landmark.type === 'bodymatter') {
          landmark.opftype = "text";
        } else {
          landmark.opftype = landmark.type;
        }
        return landmark;
      })(landmark));
    }
    return _results;
  })();
  console.log(landmarks);
  return landmarks;
};

toEpub = function(out, options) {
  var book, final, zip;

  book = Object.create(this);
  zip = zipStream.createZip({
    level: 1
  });
  zip.pipe(out);
  final = function() {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    deferred.notify('Writing to file...');
    zip.finalize(deferred.resolve);
    return promise;
  };
  return renderEpub(book, out, options, zip).then(final);
};

renderEpub = function(book, out, options, zip) {
  var tasks;

  book._state = {};
  book._state.htmltype = "application/xhtml+xml";
  book.counter = utilities.countergen();
  book.meta.landmarks = processLandmarks(book.meta.landmarks);
  book.isCover = isCover.bind(book);
  book.links = pagelinks(book, book);
  book.chapterProperties = chapterProperties.bind(book);
  tasks = [];
  tasks.push(addToZip.bind(null, zip, 'mimetype', "application/epub+zip", true));
  tasks.push(addToZip.bind(null, zip, 'META-INF/com.apple.ibooks.display-options.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<display_options>\n  <platform name="*">\n    <option name="specified-fonts">true</option>\n  </platform>\n</display_options>'));
  tasks.push(addToZip.bind(null, zip, 'META-INF/container.xml', '<?xml version="1.0" encoding="UTF-8"?>\n  <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n    <rootfiles>\n      <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />\n    </rootfiles>\n  </container>', 'META-INF/container.xml'));
  if (book.meta.cover) {
    tasks.push(addToZip.bind(null, zip, 'cover.html', templates['cover.xhtml'].render.bind(templates, book)));
  }
  tasks.push(addToZip.bind(null, zip, 'content.opf', templates['content.opf'].render.bind(templates, book)));
  tasks.push(addToZip.bind(null, zip, 'toc.ncx', templates['toc.ncx'].render.bind(templates, book)));
  tasks.push(addToZip.bind(null, zip, 'index.html', templates['index.xhtml'].render.bind(templates, book)));
  tasks.push(book.addChaptersToZip.bind(book, zip, templates['chapter.xhtml']));
  tasks.push(book.assets.addToZip.bind(book.assets, zip));
  if (book.sharedAssets) {
    tasks.push(book.sharedAssets.addToZip.bind(book.sharedAssets, zip));
  }
  if (options != null ? options.assets : void 0) {
    tasks.push(options.assets.addToZip.bind(options.assets, zip));
  }
  if ((options != null ? options.obfuscateFonts : void 0) || book.obfuscateFonts) {
    tasks.push(book.assets.mangleFonts.bind(book.assets, zip, book.id));
  }
  return sequence(tasks);
};

extendAssets = function(Assets) {
  var mangleTask;

  mangleTask = function(item, assets, zip, id) {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    assets.get(item).then(function(data) {
      var file;

      deferred.notify("Writing mangled " + item + " to zip");
      file = mangler.mangle(data, id);
      return zip.addFile(file, {
        name: item
      }, deferred.resolve);
    });
    return promise;
  };
  Assets.prototype.addMangledFontsToZip = function(zip, id) {
    var item, tasks, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;

    tasks = [];
    _ref = this['otf'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      tasks.push(mangleTask.bind(null, item, this, zip, id));
    }
    _ref1 = this['ttf'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      item = _ref1[_j];
      tasks.push(mangleTask.bind(null, item, this, zip, id));
    }
    _ref2 = this['woff'];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      item = _ref2[_k];
      tasks.push(mangleTask.bind(null, item, this, zip, id));
    }
    return sequence(tasks);
  };
  Assets.prototype.mangleFonts = function(zip, id) {
    var fonts;

    fonts = this.ttf.concat(this.otf, this.woff);
    return this.addMangledFontsToZip(zip, id).then(function() {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      zip.addFile(templates['encryption.xml'].render({
        fonts: fonts
      }), {
        name: 'META-INF/encryption.xml'
      }, deferred.resolve);
      return promise;
    });
  };
  return Assets;
};

module.exports = {
  extend: function(Book, Assets) {
    extendBook(Book);
    return extendAssets(Assets);
  },
  extendBook: extendBook,
  extendAssets: extendAssets
};
