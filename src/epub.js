'use strict';
var addFsTask, addTask, addTemplateTask, bookTemplates, callbacks, chapterTemplates, extendAssets, extendBook, extendChapter, fs, glob, handlebars, helpers, loadTemplates, mangler, path, renderEpub, sequence, template, templates, tempname, toEpub, whenjs, zipStream,
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
    {{else}}{{#if filename }}<item id="{{ id }}" href="{{ filename }}" media-type="application/xhtml+xml" properties="{{#if svg }}svg {{/if}}{{#if book.scripted }}scripted{{/if}}"/>\n{{/if}}{{#if subChapters.epubManifest}}\
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

loadTemplates = function(searchpath) {
  var name, newtemplates, temppath, _i, _len, _results;

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

  if (!Book.prototype.init) {
    Book.prototype.init = [];
  }
  Book.prototype.init.push(function(book) {
    return handlebars.registerHelper('relative', book.relative.bind(book));
  });
  Book.prototype.relative = function(current, target) {
    var absolutecurrent, absolutetarget, relativetarget;

    absolutecurrent = path.dirname(path.resolve("/", current));
    absolutetarget = path.resolve("/", target);
    relativetarget = path.relative(absolutecurrent, absolutetarget);
    console.log("Path from " + absolutecurrent + " to " + absolutetarget + " is " + relativetarget);
    return relativetarget;
  };
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
    var chapter, tasks, _i, _len, _ref;

    tasks = [];
    _ref = this.chapters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chapter = _ref[_i];
      tasks.push(chapterTask(chapter, zip));
    }
    return sequence(tasks);
  };
  Object.defineProperty(Book.prototype, 'optToc', {
    get: function() {
      var doc, _i, _len, _ref, _results;

      _ref = this.chapters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        doc = _ref[_i];
        _results.push((function(doc) {
          if (doc.toc != null) {
            return "<reference type='toc' title='Contents' href='" + doc.filename + "'></reference>";
          }
        })(doc));
      }
      return _results;
    },
    enumerable: true
  });
  Book.prototype.toEpub = toEpub;
  Object.defineProperty(Book.prototype, 'globalCounter', {
    get: function() {
      var prefix, prefre;

      prefre = new RegExp("\/", "g");
      this._globalCounter++;
      prefix = this.assetsFolder.replace(prefre, "");
      return prefix + this._globalCounter;
    },
    enumerable: true
  });
  return Book;
};

addTask = function(file, name, zip, store) {
  return function() {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    process.nextTick(function() {
      deferred.notify("" + name + " written to zip");
      return zip.addFile(file, {
        name: name,
        store: store
      }, deferred.resolve);
    });
    return promise;
  };
};

addFsTask = function(path, name, zip, store) {
  return function() {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    process.nextTick(function() {
      return fs.readFile(path, function(err, data) {
        if (err) {
          return deferred.reject;
        } else {
          deferred.notify("" + name + " written to zip");
          return zip.addFile(data, {
            name: name,
            store: store
          }, deferred.resolve);
        }
      });
    });
    return promise;
  };
};

addTemplateTask = function(template, book, zip, name, store) {
  return function() {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    process.nextTick(function() {
      deferred.notify("" + name + " written to zip");
      return zip.addFile(template(book), {
        name: name,
        store: store
      }, deferred.resolve);
    });
    return promise;
  };
};

toEpub = function(out, options) {
  var final, zip;

  zip = zipStream.createZip({
    level: 1
  });
  zip.pipe(out);
  final = function() {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    process.nextTick(function() {
      deferred.notify('Writing to file...');
      return zip.finalize(deferred.resolve);
    });
    return promise;
  };
  return renderEpub(this, out, options, zip).then(final);
};

renderEpub = function(book, out, options, zip) {
  var tasks;

  if (options != null ? options.templates : void 0) {
    loadTemplates(options.templates + '**/*.hbs');
  }
  if (book.assets.js) {
    book.scripted = true;
  }
  tasks = [];
  tasks.push(addTask("application/epub+zip", 'mimetype', zip, true));
  tasks.push(addTask('<?xml version="1.0" encoding="UTF-8"?>\n<display_options>\n  <platform name="*">\n    <option name="specified-fonts">true</option>\n  </platform>\n</display_options>', 'META-INF/com.apple.ibooks.display-options.xml', zip));
  tasks.push(addTask('<?xml version="1.0" encoding="UTF-8"?>\n  <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n    <rootfiles>\n      <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />\n    </rootfiles>\n  </container>', 'META-INF/container.xml', zip));
  if (book.meta.cover) {
    tasks.push(addFsTask(book.root + book.meta.cover, "cover.jpg", zip));
    tasks.push(addTemplateTask(templates.cover, book, zip, 'cover.html'));
  }
  tasks.push(addTemplateTask(templates.content, book, zip, 'content.opf'));
  tasks.push(addTemplateTask(templates.toc, book, zip, 'toc.ncx'));
  tasks.push(addTemplateTask(templates.nav, book, zip, 'index.html'));
  tasks.push(function() {
    return book.addChaptersToZip(zip);
  });
  tasks.push(function() {
    return book.assets.addToZip(zip);
  });
  if (book.sharedAssets) {
    tasks.push(function() {
      return book.sharedAssets.addToZip(zip);
    });
  }
  if (options != null ? options.assets : void 0) {
    tasks.push(function() {
      return options.assets.addToZip(zip);
    });
  }
  if ((options != null ? options.obfuscateFonts : void 0) || book.obfuscateFonts) {
    tasks.push(function() {
      return book.assets.mangleFonts(zip, book.id);
    });
  }
  return sequence(tasks);
};

extendAssets = function(Assets) {
  var mangleTask, zipTask;

  zipTask = function(item, root, zip) {
    return function() {
      var deferred, promise;

      deferred = whenjs.defer();
      promise = deferred.promise;
      deferred.notify('task added');
      process.nextTick(function() {
        var file;

        return file = fs.readFile(root + item, function(err, data) {
          if (err) {
            return deferred.reject;
          } else {
            deferred.notify("Writing " + item + " to zip");
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
    var tasks, type, types, _i, _len;

    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      tasks.push(this.addTypeToZip.bind(this, type, zip));
    }
    return sequence(tasks);
  };
  Assets.prototype.addTypeToZip = function(type, zip) {
    var item, tasks, _i, _len, _ref;

    tasks = [];
    _ref = this[type];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      tasks.push(zipTask(item, this.root, zip));
    }
    return sequence(tasks);
  };
  Assets.prototype.addMangledFontsToZip = function(zip, id) {
    var item, tasks, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;

    tasks = [];
    _ref = this['otf'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      tasks.push(mangleTask(item, this.root, zip, id));
    }
    _ref1 = this['ttf'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      item = _ref1[_j];
      tasks.push(mangleTask(item, this.root, zip, id));
    }
    _ref2 = this['woff'];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      item = _ref2[_k];
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
