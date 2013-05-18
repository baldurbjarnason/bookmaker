'use strict';
var Assets, fs, glob, mglob, nodefn, pglob, whenjs, _;

glob = require('glob');

whenjs = require('when');

nodefn = require("when/node/function");

pglob = nodefn.lift(glob);

_ = require('underscore');

fs = require('fs');

Assets = (function() {
  function Assets(root, assetsPath) {
    this.root = root;
    this.assetsPath = assetsPath;
  }

  Assets.prototype.pngPromise = function() {
    return pglob(this.assetsPath + '**/*.png', {
      cwd: this.root
    });
  };

  Assets.prototype.jpgPromise = function() {
    return pglob(this.assetsPath + '**/*.jpg', {
      cwd: this.root
    });
  };

  Assets.prototype.gifPromise = function() {
    return pglob(this.assetsPath + '**/*.gif', {
      cwd: this.root
    });
  };

  Assets.prototype.cssPromise = function() {
    return pglob(this.assetsPath + '**/*.css', {
      cwd: this.root
    });
  };

  Assets.prototype.svgPromise = function() {
    return pglob(this.assetsPath + '**/*.svg', {
      cwd: this.root
    });
  };

  Assets.prototype.jsPromise = function() {
    return pglob(this.assetsPath + '**/*.js', {
      cwd: this.root
    });
  };

  Assets.prototype.ttfPromise = function() {
    return pglob(this.assetsPath + '**/*.ttf', {
      cwd: this.root
    });
  };

  Assets.prototype.otfPromise = function() {
    return pglob(this.assetsPath + '**/*.otf', {
      cwd: this.root
    });
  };

  Assets.prototype.woffPromise = function() {
    return pglob(this.assetsPath + '**/*.woff', {
      cwd: this.root
    });
  };

  Assets.prototype.get = function(path) {
    var deferred, fn, promise;

    deferred = whenjs.defer();
    promise = deferred.promise;
    fn = this.root + path;
    fs.readFile(fn, function(err, data) {
      if (err) {
        return deferred.reject;
      } else {
        return deferred.resolve(data, path);
      }
    });
    return promise;
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
