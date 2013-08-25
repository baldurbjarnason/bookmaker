'use strict';
var Assets, async, fs, glob, log, ncp, path;

glob = require('glob');

async = require('async');

fs = require('fs');

ncp = require('ncp').ncp;

path = require('path');

log = require('./logger').logger();

Assets = (function() {
  function Assets(root, assetsPath) {
    this.root = root;
    this.assetsPath = assetsPath;
  }

  Assets.prototype.get = function(filepath, callback) {
    var fn;

    fn = path.resolve(this.root, filepath);
    return fs.readFile(fn, callback);
  };

  Assets.prototype.getStream = function(filepath, options) {
    return fs.createReadStream(path.resolve(this.root, filepath), options);
  };

  Assets.prototype.addItemToZip = function(item, zip, callback) {
    var resolver;

    resolver = function() {
      log.info("" + item + " written to zip");
      return callback();
    };
    return zip.addFile(this.getStream(item), {
      name: item
    }, resolver);
  };

  Assets.prototype.addTypeToZip = function(type, zip, callback) {
    var item, tasks, _i, _len, _ref;

    tasks = [];
    _ref = this[type];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      tasks.push(this.addItemToZip.bind(this, item, zip));
    }
    return async.series(tasks, callback);
  };

  Assets.prototype.addToZip = function(zip, callback) {
    var tasks, type, types, _i, _len;

    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      tasks.push(this.addTypeToZip.bind(this, type, zip));
    }
    return async.series(tasks, callback);
  };

  Assets.prototype.copy = function(directory, callback) {
    var resolver, source;

    source = path.resolve(this.root, this.assetsPath);
    resolver = function(err) {
      log.info("Assets copied");
      return callback(err);
    };
    return ncp(source, directory, resolver);
  };

  Assets.prototype.init = function(callback) {
    var task, tasks, type, types, _i, _len;

    task = function(type, callback) {
      var jpegList;

      if (!this.assetsPath) {
        this.assetsPath = "";
      }
      if (this.assetsPath === ".") {
        this.assetsPath = "";
      }
      this[type] = glob.sync(this.assetsPath + ("**/*." + type), {
        cwd: this.root
      });
      if (type === 'jpg') {
        jpegList = glob.sync(this.assetsPath + "**/*.jpeg", {
          cwd: this.root
        });
        this.jpg = this.jpg.concat(jpegList);
      }
      return callback();
    };
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      tasks.push(task.bind(this, type));
    }
    return async.series(tasks, callback);
  };

  Assets.prototype.initSync = function() {
    var jpeg, newAssetsPath, tasks, type, types, _i, _len;

    newAssetsPath = this.assetsPath;
    if (!newAssetsPath) {
      newAssetsPath = "";
    }
    if (newAssetsPath === '.') {
      newAssetsPath = "";
    }
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      this[type] = glob.sync(newAssetsPath + ("**/*." + type), {
        cwd: this.root
      });
    }
    jpeg = glob.sync(newAssetsPath + "**/*.jpeg", {
      cwd: this.root
    });
    this.jpg = this.jpg.concat(jpeg);
  };

  return Assets;

})();

module.exports = Assets;
