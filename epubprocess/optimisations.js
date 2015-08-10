"use strict";
var async, css, cssOptimise, csso, exec, execTask, fs, getTemporaryFilePath, jpegtranPath, jpg, js, logger, minifyAssetsFunction, optipath, optipngTask, path, pngquant, pngquantPath, svgo, uglifyJS, utilities;

exec = require('child_process').exec;

csso = require('csso');

path = require('path');

fs = require('fs');

svgo = require('svgo');

uglifyJS = require("uglify-js");

async = require('async');

pngquantPath = require('pngquant-bin').path;

optipath = require('optipng-bin').path;

jpegtranPath = require('jpegtran-bin').path;

utilities = require('./utilities');

logger = utilities.logger;

getTemporaryFilePath = require('gettemporaryfilepath');

execTask = function(command) {
  return function(callback) {
    logger.log.info(command);
    return exec(command, function(err, stdout, stderr) {
      if (err) {
        logger.log.error(err);
        callback(err);
      }
      return callback();
    });
  };
};

minifyAssetsFunction = function(type, fn) {
  return function(book, callback) {
    var minified, typepath, unminified, _i, _len, _ref;
    if (book.assets[type].length > 0) {
      _ref = book.assets[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        typepath = _ref[_i];
        typepath = path.join(book.assets.root, typepath);
        unminified = fs.readFileSync(typepath, 'utf8');
        minified = fn(unminified);
        fs.writeFileSync(typepath, minified);
      }
      console.log("" + type + " minified");
    }
    return callback(null, book);
  };
};

cssOptimise = minifyAssetsFunction('css', function(css) {
  var minified;
  return minified = csso.justDoIt(css);
});

css = minifyAssetsFunction('css', function(css) {
  var minified;
  return minified = csso.justDoIt(css, true);
});

js = minifyAssetsFunction('js', function(js) {
  var minified;
  return minified = uglifyJS.minify(js, {
    fromString: true
  });
});

pngquant = function(book, callback) {
  var command, tasks, typepath, _i, _len, _ref;
  tasks = [];
  console.log('pngquant running...');
  if (book.assets.png.length > 0) {
    _ref = book.assets.png;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      typepath = _ref[_i];
      typepath = path.join(book.assets.root, typepath);
      command = pngquantPath + " -f --ext .png " + typepath;
      tasks.push(execTask(command));
    }
    return async.series(tasks, function(err) {
      console.log("pngquant run");
      if (err) {
        console.log(err);
        callback(err);
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

optipngTask = function(optimisations) {
  return function(book, callback) {
    var tasks, tmppng, typepath, _i, _len, _ref;
    console.log('optipng running...');
    tasks = [];
    if (book.assets.png.length > 0) {
      _ref = book.assets.png;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        typepath = _ref[_i];
        tmppng = getTemporaryFilePath({
          suffix: '.png'
        });
        typepath = path.join(book.assets.root, typepath);
        tasks.push(execTask(optipath + (" -strip all -o " + optimisations + " -out " + tmppng + "-- ") + typepath));
      }
      return async.series(tasks, function(err) {
        if (err) {
          console.log(err);
          callback(err);
        }
        console.log('optipng run');
        return callback(null, book);
      });
    } else {
      return callback(null, book);
    }
  };
};

jpg = function(book, callback) {
  var tasks, typepath, _i, _len, _ref;
  tasks = [];
  console.log('jpg running...');
  _ref = book.assets.jpg;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    typepath = _ref[_i];
    typepath = path.join(book.assets.root, typepath);
    tasks.push(execTask(jpegtranPath + (" -progressive -copy none -optimize -outfile " + typepath + " ") + typepath));
  }
  return async.series(tasks, function(err) {
    console.log("jpg minified");
    if (err) {
      console.log(err);
      callback(err);
    }
    return callback(null, book);
  });
};

module.exports = {
  csso: cssOptimise,
  css: css,
  pngquant: pngquant,
  optipngTask: optipngTask,
  tasks: [js, jpg]
};
