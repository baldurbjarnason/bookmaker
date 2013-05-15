'use strict';
var Assets, glob, nodefn, pglob, whenjs;

glob = require('glob');

whenjs = require('when');

nodefn = require("when/node/function");

pglob = nodefn.lift(glob);

Assets = (function() {
  function Assets(root, assetFolder) {
    this.root = root;
    this.assetFolder = assetFolder;
  }

  Assets.prototype.pngPromise = function() {
    return pglob(this.assetFolder + '**/*.png', {
      cwd: this.root
    });
  };

  Assets.prototype.jpgPromise = function() {
    return pglob(this.assetFolder + '**/*.jpg', {
      cwd: this.root
    });
  };

  Assets.prototype.gifPromise = function() {
    return pglob(this.assetFolder + '**/*.gif', {
      cwd: this.root
    });
  };

  Assets.prototype.cssPromise = function() {
    return pglob(this.assetFolder + '**/*.css', {
      cwd: this.root
    });
  };

  Assets.prototype.svgPromise = function() {
    return pglob(this.assetFolder + '**/*.svg', {
      cwd: this.root
    });
  };

  Assets.prototype.jsPromise = function() {
    return pglob(this.assetFolder + '**/*.js', {
      cwd: this.root
    });
  };

  Assets.prototype.ttfPromise = function() {
    return pglob(this.assetFolder + '**/*.ttf', {
      cwd: this.root
    });
  };

  Assets.prototype.otfPromise = function() {
    return pglob(this.assetFolder + '**/*.otf', {
      cwd: this.root
    });
  };

  Assets.prototype.woffPromise = function() {
    return pglob(this.assetFolder + '**/*.woff', {
      cwd: this.root
    });
  };

  return Assets;

})();

Object.defineProperty(Assets.prototype, 'png', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.png', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'jpg', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.jpg', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'gif', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.gif', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'css', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.css', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'svg', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.svg', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'js', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.js', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'ttf', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.ttf', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'otf', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.otf', {
      cwd: this.root
    });
  },
  enumerable: true
});

Object.defineProperty(Assets.prototype, 'woff', {
  get: function() {
    return glob.sync(this.assetFolder + '**/*.woff', {
      cwd: this.root
    });
  },
  enumerable: true
});

module.exports = Assets;
