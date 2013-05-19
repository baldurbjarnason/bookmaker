'use strict';
var Assets, fs, glob, mglob, nodefn, pglob, sequence, whenjs, _;

glob = require('glob');

whenjs = require('when');

sequence = require('when/sequence');

nodefn = require("when/node/function");

pglob = nodefn.lift(glob);

_ = require('underscore');

fs = require('fs');

Assets = (function() {
  function Assets(root, assetsPath) {
    this.root = root;
    this.assetsPath = assetsPath;
  }

  Assets.prototype.get = function(filepath) {
    var deferred, fn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    fn = this.root + filepath;
    fs.readFile(fn, function(err, data) {
      if (err) {
        return deferred.reject;
      } else {
        return deferred.resolve(data, filepath);
      }
    });
    return promise;
  };

  Assets.prototype.getStream = function(filepath, options) {
    return fs.createReadStream(this.root + filepath, options);
  };

  Assets.prototype.addItemToZip = function(item, zip) {
    var deferred, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    deferred.notify("Writing " + item + " to zip");
    zip.addFile(this.getStream(item), {
      name: item
    }, deferred.resolve);
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

  return Assets;

})();

mglob = _.memoize(glob.sync);

Object.defineProperty(Assets.prototype, 'png', {
  get: function() {
    return mglob(this.assetsPath + '**/*.png', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'jpg', {
  get: function() {
    return mglob(this.assetsPath + '**/*.jpg', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'gif', {
  get: function() {
    return mglob(this.assetsPath + '**/*.gif', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'css', {
  get: function() {
    return mglob(this.assetsPath + '**/*.css', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'svg', {
  get: function() {
    return mglob(this.assetsPath + '**/*.svg', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'js', {
  get: function() {
    return mglob(this.assetsPath + '**/*.js', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'ttf', {
  get: function() {
    return mglob(this.assetsPath + '**/*.ttf', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'otf', {
  get: function() {
    return mglob(this.assetsPath + '**/*.otf', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'woff', {
  get: function() {
    return mglob(this.assetsPath + '**/*.woff', {
      cwd: this.root
    });
  },
  enumerable: true
});

module.exports = Assets;
