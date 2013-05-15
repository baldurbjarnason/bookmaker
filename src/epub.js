'use strict';
var bookTemplates, callbacks, chapterTemplates, extendAssets, extendBook, extendChapter, fs, glob, handlebars, helpers, mangler, name, newtemplates, path, renderEpub, sequence, template, templates, tempname, temppath, toEpub, whenjs, zipStream, _i, _len,
  __hasProp = {}.hasOwnProperty;

zipStream = require('zipstream-contentment');

handlebars = require('handlebars');

helpers = require('./lib/hbs.js');

whenjs = require('when');

callbacks = require('when/callbacks');

path = require('path');

glob = require('glob');

fs = require('fs');

mangler = require('./lib/mangler');

sequence = require('when/sequence');

chapterTemplates = {
  manifest: '{{#if this.nomanifest }}\
    {{else}}{{#if filename }}<item id="{{ id }}" href="{{ filename }}" media-type="application/xhtml+xml"{{#if svg }} properties="svg"{{/if}}/>\n{{/if}}{{#if subChapters.epubManifest}}\
    {{ subChapters.epubManifest }}{{/if}}{{/if}}',
  spine: '{{#if filename }}<itemref idref="{{ id }}" linear="yes"></itemref>\n{{/if}}{{#if subChapters.epubManifest}}\
    {{ subChapters.epubSpine }}{{/if}}',
  nav: '<li class="tocitem {{ id }}{{#if majornavitem}} majornavitem{{/if}}" id="toc-{{ id }}">{{#if filename }}<a href="{{ filename }}">{{/if}}{{ title }}{{#if filename }}</a>\n{{/if}}\
{{ subChapters.navList }}\
</li>\n',
  ncx: '{{#if filename }}<navPoint id="navPoint-{{ book.navPoint }}" playOrder="{{ book.chapterIndex }}">\n  <navLabel>\n      <text>{{ title }}</text>\n  </navLabel>\n  <content src="{{ filename }}"></content>\n{{ subChapters.epubNCX }}</navPoint>{{else}}\n {{ subChapters.epubNCX }}\n{{/if}}'
};

bookTemplates = {
  manifest: '{{#each chapters }}{{{ this.epubManifest }}}{{/each}}',
  spine: '{{#each chapters }}{{{ this.epubSpine }}}{{/each}}',
  nav: '{{#each chapters }}{{{ this.navList }}}{{/each}}',
  ncx: '{{#each chapters }}{{{ this.epubNCX }}}{{/each}}'
};

for (tempname in chapterTemplates) {
  if (!__hasProp.call(chapterTemplates, tempname)) continue;
  template = chapterTemplates[tempname];
  chapterTemplates[tempname] = handlebars.compile(template);
}

for (tempname in bookTemplates) {
  template = bookTemplates[tempname];
  bookTemplates[tempname] = handlebars.compile(template);
}

templates = {};

newtemplates = glob.sync(path.resolve(module.filename, '../../', 'templates/**/*.hbs'));

newtemplates.concat(glob.sync('templates/**/*.hbs'));

for (_i = 0, _len = newtemplates.length; _i < _len; _i++) {
  temppath = newtemplates[_i];
  name = path.basename(temppath, path.extname(temppath));
  template = fs.readFileSync(temppath, 'utf8');
  templates[name] = handlebars.compile(template);
}

extendChapter = function(Chapter) {
  Object.defineProperty(Chapter.prototype, 'epubManifest', {
    get: function() {
      var manifest;

      manifest = chapterTemplates.manifest(this.context());
      return manifest;
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'epubSpine', {
    get: function() {
      return chapterTemplates.spine(this.context());
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'navList', {
    get: function() {
      return chapterTemplates.nav(this.context());
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'epubNCX', {
    get: function() {
      return chapterTemplates.ncx(this.context());
    },
    enumerable: true
  });
  Chapter.prototype.addToZip = function(zip) {
    var context, deferred, fn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    context = this.context;
    fn = this.filename;
    process.nextTick(function() {
      return zip.addFile(templates.chapters(context()), {
        name: fn
      }, deferred.resolve);
    });
    return promise;
  };
  return Chapter;
};

extendBook = function(Book) {
  var chapterTask;

  Object.defineProperty(Book.prototype, 'epubManifest', {
    get: function() {
      return bookTemplates.manifest(this);
    },
    enumerable: true
  });
  Object.defineProperty(Book.prototype, 'epubSpine', {
    get: function() {
      return bookTemplates.spine(this);
    },
    enumerable: true
  });
  Object.defineProperty(Book.prototype, 'navList', {
    get: function() {
      return bookTemplates.nav(this);
    },
    enumerable: true
  });
  Object.defineProperty(Book.prototype, 'epubNCX', {
    get: function() {
      return bookTemplates.ncx(this);
    },
    enumerable: true
  });
  Object.defineProperty(Book.prototype, 'chapterIndex', {
    get: function() {
      this._chapterIndex++;
      return this._chapterIndex;
    },
    enumerable: true
  });
  Object.defineProperty(Book.prototype, 'navPoint', {
    get: function() {
      this._navPoint++;
      return this._navPoint;
    },
    enumerable: true
  });
  chapterTask = function(chapter, zip) {
    return function() {
      return chapter.addToZip(zip);
    };
  };
  Book.prototype.addChaptersToZip = function(zip) {
    var chapter, tasks, _j, _len1, _ref;

    tasks = [];
    _ref = this.chapters;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      chapter = _ref[_j];
      tasks.push(chapterTask(chapter, zip));
    }
    return sequence(tasks);
  };
  Book.prototype.toEpub = toEpub;
  return Book;
};

toEpub = function(out) {
  var deferred, promise;

  deferred = whenjs.defer();
  promise = deferred.promise;
  renderEpub(this, out, deferred.resolver);
  return promise;
};

renderEpub = function(book, out, resolver) {
  var zip, zippromises;

  zip = zipstream.createZip({
    level: 1
  });
  zip.pipe(out);
  zip.add = callbacks.lift(zip.addFile);
  zip.final = callbacks.lift(zip.finalize);
  zippromises = [
    zip.add('<?xml version="1.0" encoding="UTF-8"?>\n<display_options>\n  <platform name="*">\n    <option name="specified-fonts">true</option>\n  </platform>\n</display_options>', {
      name: 'META-INF/com.apple.ibooks.display-options.xml'
    }), zip.add("application/epub+zip", {
      name: 'mimetype'
    }), zip.add('<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />\n  </rootfiles>\n</container>', 'container.xml'), zip.add(fs.createReadStream(path.join(book.root, 'cover.jpg')), {
      name: 'cover.jpg'
    }), zip.add(this.templates.content(book.context), {
      name: 'content.opf'
    }), zip.add(this.templates.cover(book.context), {
      name: 'cover.html'
    }), zip.add(this.templates.toc(book.context), {
      name: 'toc.ncx'
    }), zip.add(this.templates.nav(book.context), {
      name: 'index.html'
    }), book.addChaptersToZip(zip), book.assets.addToZip(zip)
  ];
  if (book.sharedAssets) {
    zippromises.push(book.sharedAssets.addToZip(zip));
  }
  if (options.obfuscateFonts) {
    zippromises.push(book.assets.mangleFonts(zip, book.id));
  }
  return whenjs.all(zippromises).then(zip.final()).then(resolver.resolved, resolver.reject);
};

extendAssets = function(Assets) {
  var mangleTask, zipTask;

  zipTask = function(item, root, zip) {
    return function() {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      process.nextTick(function() {
        var file;

        return file = fs.readFile(root + item, function(err, data) {
          if (err) {
            return deferred.reject;
          } else {
            return zip.addFile(data, {
              name: item
            }, deferred.resolve);
          }
        });
      });
      return promise;
    };
  };
  mangleTask = function(item, root, zip, id) {
    return function() {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      process.nextTick(function() {
        return fs.readFile(root + item, function(err, data) {
          var file;

          if (err) {
            return deferred.reject;
          } else {
            file = mangler.mangle(data, id);
            return zip.addFile(file, {
              name: item
            }, deferred.resolve);
          }
        });
      });
      return promise;
    };
  };
  Assets.prototype.addToZip = function(zip) {
    var tasks, type, types, _j, _len1;

    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_j = 0, _len1 = types.length; _j < _len1; _j++) {
      type = types[_j];
      tasks.push(this.addTypeToZip.bind(this, type, zip));
    }
    return sequence(tasks);
  };
  Assets.prototype.addTypeToZip = function(type, zip) {
    var item, tasks, _j, _len1, _ref;

    tasks = [];
    _ref = this[type];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      item = _ref[_j];
      tasks.push(zipTask(item, this.root, zip));
    }
    return sequence(tasks);
  };
  Assets.prototype.addMangledFontsToZip = function(zip, id) {
    var item, tasks, _j, _k, _l, _len1, _len2, _len3, _ref, _ref1, _ref2;

    tasks = [];
    _ref = this['otf'];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      item = _ref[_j];
      tasks.push(mangleTask(item, this.root, zip, id));
    }
    _ref1 = this['ttf'];
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      item = _ref1[_k];
      tasks.push(mangleTask(item, this.root, zip, id));
    }
    _ref2 = this['woff'];
    for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
      item = _ref2[_l];
      tasks.push(mangleTask(item, this.root, zip, id));
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
      process.nextTick(function() {
        return zip.addFile(templates.encryption(fonts), {
          name: 'META-INF/encryption.xml'
        }, deferred.resolve);
      });
      return promise;
    });
  };
  return Assets;
};

module.exports = {
  extend: function(Chapter, Book, Assets) {
    extendChapter(Chapter);
    extendBook(Book);
    return extendAssets(Assets);
  },
  extendChapter: extendChapter,
  extendBook: extendBook,
  extendAssets: extendAssets
};
