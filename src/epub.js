'use strict';
var Chapter, addStoredToZip, addToZip, async, chapterProperties, env, extendAssets, extendBook, fs, generateChapters, glob, isCover, logger, mangler, nunjucks, pageLinks, path, processLandmarks, relative, renderEpub, toEpub, utilities, zipStream;

zipStream = require('zipstream-contentment');

async = require('async');

path = require('path');

glob = require('glob');

fs = require('fs');

mangler = require('./mangler');

utilities = require('./utilities');

relative = utilities.relative;

pageLinks = utilities.pageLinks;

addToZip = utilities.addToZip;

addStoredToZip = utilities.addStoredToZip;

logger = require('./logger');

nunjucks = require('nunjucks');

env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__filename, '../../', 'templates/')), {
  autoescape: false
});

env.getTemplate('cover.xhtml').render();

Chapter = require('./chapter');

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
  logger.log.info('EPUB – Landmarks prepared');
  return landmarks;
};

generateChapters = function(book) {
  var copyright, titlepage, toc;

  if (book.generate.htmlToc) {
    toc = {
      title: 'Table of Contents',
      type: 'html',
      filename: 'htmltoc.html',
      body: env.getTemplate('htmltoc.xhtml').render(book)
    };
    book.prependChapter(new Chapter(toc));
    book.meta.landmarks.push({
      type: 'toc',
      title: 'Table of Contents',
      href: 'htmltoc.html'
    });
  }
  copyright = {
    title: 'Copyright',
    type: 'md',
    filename: 'copyright.html',
    body: "Copyright " + book.meta.copyrightYear + " " + book.meta.author + ", all rights reserved."
  };
  if (book.generate.copyrightFront) {
    book.prependChapter(new Chapter(copyright));
  }
  if (book.generate.copyrightBack) {
    book.addChapter(new Chapter(copyright));
  }
  if (book.generate.copyrightFront || book.generate.copyrightBack) {
    book.meta.landmarks.push({
      type: 'copyright-page',
      title: 'Copyright',
      href: 'copyright.html'
    });
  }
  if (book.generate.title) {
    titlepage = {
      title: book.meta.title,
      type: 'md',
      filename: 'titlepage.html',
      body: "# " + book.meta.title + "\n\n## by " + book.meta.author
    };
    book.prependChapter(new Chapter(titlepage));
    return book.meta.landmarks.push({
      type: 'titlepage',
      title: 'Title Page',
      href: 'titlepage.html'
    });
  }
};

toEpub = function(out, options, callback) {
  var book, final, zip;

  logger.log.info('Rendering EPUB');
  book = Object.create(this);
  zip = zipStream.createZip({
    level: 1
  });
  zip.pipe(out);
  final = function(err, result) {
    if (err) {
      callback(err);
    }
    logger.log.info('Finishing...');
    return zip.finalize(function(written) {
      return callback(null, written);
    });
  };
  return renderEpub(book, out, options, zip, final);
};

renderEpub = function(book, out, options, zip, callback) {
  var tasks;

  book._state = {};
  book._state.htmltype = "application/xhtml+xml";
  book.counter = utilities.countergen();
  book.meta.landmarks = processLandmarks(book.meta.landmarks);
  book.isCover = isCover.bind(book);
  book.links = pageLinks(book, book);
  book.chapterProperties = chapterProperties.bind(book);
  book.idGen = utilities.idGen;
  if (options && options.exclude) {
    book.exclude = options.exclude;
  }
  generateChapters(book);
  tasks = [];
  tasks.push(addStoredToZip.bind(null, zip, 'mimetype', "application/epub+zip"));
  tasks.push(addToZip.bind(null, zip, 'META-INF/com.apple.ibooks.display-options.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<display_options>\n  <platform name="*">\n    <option name="specified-fonts">true</option>\n  </platform>\n</display_options>'));
  tasks.push(addToZip.bind(null, zip, 'META-INF/container.xml', '<?xml version="1.0" encoding="UTF-8"?>\n  <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n    <rootfiles>\n      <rootfile full-path="content.opf" media-type="application/oebps-package+xml" />\n    </rootfiles>\n  </container>'));
  if (book.meta.cover) {
    tasks.push(addToZip.bind(null, zip, 'cover.html', env.getTemplate('cover.xhtml').render.bind(env.getTemplate('cover.xhtml'), book)));
  }
  tasks.push(addToZip.bind(null, zip, 'toc.ncx', env.getTemplate('toc.ncx').render.bind(env.getTemplate('toc.ncx'), book)));
  tasks.push(addToZip.bind(null, zip, 'index.html', env.getTemplate('index.xhtml').render.bind(env.getTemplate('index.xhtml'), book)));
  tasks.push(book.addChaptersToZip.bind(book, zip, env.getTemplate('chapter.xhtml')));
  if (options != null ? options.exclude : void 0) {
    tasks.push(book.assets.addToZip.bind(book.assets, zip, options));
  } else {
    tasks.push(book.assets.addToZip.bind(book.assets, zip));
  }
  tasks.push(addToZip.bind(null, zip, 'content.opf', env.getTemplate('content.opf').render.bind(env.getTemplate('content.opf'), book)));
  if ((options != null ? options.obfuscateFonts : void 0) || book.obfuscateFonts) {
    tasks.push(book.assets.mangleFonts.bind(book.assets, zip, book.meta.bookId));
  }
  return async.series(tasks, callback);
};

extendAssets = function(Assets) {
  var mangleTask;

  mangleTask = function(item, assets, zip, id, callback) {
    return assets.get(item, function(err, data) {
      var file;

      file = mangler.mangle(data, id);
      return zip.addFile(file, {
        name: item
      }, callback);
    });
  };
  Assets.prototype.addMangledFontsToZip = function(zip, id, callback) {
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
    return async.series(tasks, callback);
  };
  Assets.prototype.mangleFonts = function(zip, id, callback) {
    var fonts;

    fonts = this.ttf.concat(this.otf, this.woff);
    return this.addMangledFontsToZip(zip, id, function() {
      return zip.addFile(env.getTemplate('encryption.xml').render({
        fonts: fonts
      }), {
        name: 'META-INF/encryption.xml'
      }, callback);
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
