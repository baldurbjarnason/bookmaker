'use strict';
var bookTemplates, callbacks, chapterTemplates, extendAssets, extendBook, extendChapter, fs, glob, handlebars, helpers, mangler, path, renderEpub, template, templates, toEpub, whenjs, zipStream;

zipStream = require('zipstream-contentment');

handlebars = require('handlebars');

helpers = require('./lib/hbs.js');

whenjs = require('when');

callbacks = require('when/callbacks');

templates = require('../lib/templates');

path = require('path');

glob = require('glob');

fs = require('fs');

mangler = require('./lib/mangler');

chapterTemplates = {
  manifest: '{{#if filename }}<item id="{{ id }}" href="{{ filename }}" media-type="application/xhtml+xml"\
    {{#if svg }}properties="svg"{{/if}}/>{{/if}}\
    {{ subChapters.epubManifest }}',
  spine: '{{#if filename }}<itemref idref="{{ id }}" linear="yes"></itemref>{{/if}}\
    {{ subChapters.epubSpine }}',
  nav: '<li class="tocitem {{ id }}{{#if majornavitem}} majornavitem{{/if}}" id="toc-{{ id }}">{{#if filename }}<a href="{{ filename }}">{{/if}}{{ title }}{{#if filename }}</a>{{/if}}\
    {{ subChapters.navList }}\
    </li>',
  ncx: '{{#if filename }}<navPoint id="navPoint-{{ navPoint }}" playOrder="{{ chapterIndex }}">\
            <navLabel>\
                <text>{{ title }}</text>\
            </navLabel>\
            <content src="{{ filename }}"></content>\
            {{ subChapters.epubNCX }}\
        </navPoint>{{else}}\
         {{ subChapters.epubNCX }}\
        {{/if}}'
};

bookTemplates = {
  manifest: '{{#each chapters }}{{ this.epubManifest }}{{/each}}',
  spine: '{{#each chapters }}{{ this.epubSpine }}{{/each}}',
  nav: '{{#each chapters }}{{ this.navList }}{{/each}}',
  ncx: '{{#each chapters }}{{ this.epubNCX }}{{/each}}'
};

for (template in chapterTemplates) {
  chapterTemplates[template] = handlebars.compile(template);
}

for (template in bookTemplates) {
  bookTemplates[template] = handlebars.compile(template);
}

extendChapter = function(Chapter) {
  Object.defineProperty(Chapter.prototype, 'epubManifest', {
    get: function() {
      return chapterTemplates.manifest(this);
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'epubSpine', {
    get: function() {
      return chapterTemplates.spine(this);
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'navList', {
    get: function() {
      return chapterTemplates.nav(this);
    },
    enumerable: true
  });
  Object.defineProperty(Chapter.prototype, 'epubNCX', {
    get: function() {
      return chapterTemplates.ncx(this);
    },
    enumerable: true
  });
  Chapter.prototype.addToZip = function(book, zip) {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    this.addToZipFn(book, zip, deferred.resolver);
    return promise;
  };
  Chapter.prototype.addToZipFn = function(book, zip, resolver) {
    var context, fn, respond;

    this.htmlPromise.then(respond, resolver.reject);
    context = this.context();
    fn = this.filename;
    respond = function(html) {
      zip.add(this.book.templates.chapter(context), {
        name: fn
      });
      return resolver.resolve(fn);
    };
  };
  return Chapter;
};

extendBook = function(Book) {
  var name, newtemplates, temppath, _i, _len;

  Object.defineProperty(Book.prototype, 'chapterList', {
    get: function() {
      return findSubs(this.chapters);
    },
    enumerable: true
  });
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
  Book.prototype.addChaptersToZip = function(zip) {
    var chapterFn;

    chapterFn = function(chapter) {
      return chapter.addToZip(this, zip);
    };
    return whenjs.map(this.chapters, chapterFn);
  };
  Book.prototype.toEpub = toEpub;
  newtemplates = glob.sync(path.resolve(module.filename, '../../', 'templates/**/*.hbs'));
  newtemplates.concat(glob.sync('templates/**/*.hbs'));
  for (_i = 0, _len = newtemplates.length; _i < _len; _i++) {
    temppath = newtemplates[_i];
    name = path.basename(temppath, path.extname(temppath));
    template = fs.readFileSync(temppath, 'utf8');
    templates[name] = handlebars.compile(template);
  }
  Book.prototype.templates = templates;
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
  Assets.prototype.addToZip = function(zip) {
    var promises, type, types, _i, _len;

    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    promises = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      promises.push(this.addTypeToZip(type, zip));
    }
    return whenjs.all(promises);
  };
  Assets.prototype.addTypeToZip = function(type, zip) {
    var deferred, mapFn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    mapFn = function(item) {
      var file;

      file = fs.readFileSync(this.root + item);
      return zip.add(file, {
        name: item
      });
    };
    getAssets(type, mapFn, deferred.resolver);
    return promise;
  };
  Assets.prototype.addMangledFontsToZip = function(type, zip, id) {
    var deferred, mapFn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    mapFn = function(item) {
      var file;

      file = mangler.mangle(fs.readFileSync(this.root + item, id));
      return zip.add(file, {
        name: item
      });
    };
    getAssets(type, mapFn, deferred.resolver);
    return promise;
  };
  Assets.prototype.mangleFonts = function(zip, id) {
    var alltypes, fonts;

    alltypes = [this.addMangledFontsToZip('woff', zip, id), this.addMangledFontsToZip('ttf', zip, id), this.addMangledFontsToZip('otf', zip, id)];
    fonts = this.ttf.concat(this.otf, this.woff);
    return whenjs.all(alltypes).then(function() {
      return zip.add(this.templates.encryption(fonts), {
        name: 'META-INF/encryption.xml'
      });
    });
  };
  Assets.prototype.getAssets = function(type, fn, resolver) {
    return whenjs.map(this[type], fn).then(resolver.resolve, resolver.reject);
  };
  return Assets;
};

module.exports = {
  extend: function(Chapter, Book, Assets) {
    extendChapter(Chapter);
    extendBook(Book);
    return extendAssets(Assets);
  }
};
