'use strict';
var Assets, fs, glob, log, ncp, nodefn, path, pglob, sequence, whenjs, _;

glob = require('glob');

whenjs = require('when');

sequence = require('when/sequence');

nodefn = require("when/node/function");

pglob = nodefn.lift(glob);

_ = require('underscore');

fs = require('fs');

ncp = require('ncp').ncp;

path = require('path');

log = require('./logger').logger();

Assets = (function() {
  function Assets(root, assetsPath) {
    this.root = root;
    this.assetsPath = assetsPath;
  }

  Assets.prototype.get = function(filepath) {
    var deferred, fn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    fn = path.resolve(this.root, filepath);
    fs.readFile(fn, function(err, data) {
      if (err) {
        log.error(err);
        return deferred.reject;
      } else {
        return deferred.resolve(data, filepath);
      }
    });
    return promise;
  };

  Assets.prototype.getStream = function(filepath, options) {
    return fs.createReadStream(path.resolve(this.root, filepath), options);
  };

  Assets.prototype.addItemToZip = function(item, zip) {
    var deferred, promise, resolver;

    deferred = whenjs.defer();
    promise = deferred.promise;
    resolver = function() {
      log.info("" + item + " written to zip");
      return deferred.resolve();
    };
    zip.addFile(this.getStream(item), {
      name: item
    }, resolver);
    return promise;
  };

  Assets.prototype.addTypeToZip = function(type, zip) {
    var item, tasks, _i, _len, _ref;

    tasks = [];
    _ref = this[type];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      tasks.push(this.addItemToZip.bind(this, item, zip));
    }
    return sequence(tasks);
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

  Assets.prototype.copy = function(directory) {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    deferred.notify("Copying assets");
    ncp(path.resolve(this.root, this.assetsPath), directory, function(err) {
      if (err) {
        log.error(err);
        return deferred.reject(err);
      } else {
        log.info("Assets copied to " + directory);
        return deferred.resolve();
      }
    });
    return promise;
  };

  Assets.prototype.init = function() {
    var task, tasks, type, types, _i, _len;

    task = function(type) {
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
    };
    types = ['png', 'gif', 'jpg', 'css', 'js', 'svg', 'ttf', 'otf', 'woff'];
    tasks = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      tasks.push(task.bind(this, type));
    }
    return sequence(tasks).then(function() {
      return this;
    });
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
