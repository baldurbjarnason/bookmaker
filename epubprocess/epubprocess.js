#!/usr/bin/env node
;
'use strict';
var async, fs, initAndProcessChapters, initAssets, optimisations, originalSize, program, prompts, setup, utilities;

program = require('./program');

utilities = require('./utilities');

setup = utilities.setup;

async = require('async');

prompts = require('./prompts');

optimisations = require('./optimisations');

fs = require('fs');

initAndProcessChapters = function(book, callback) {
  var chapter, _i, _len, _ref;
  book.assets.initSync();
  _ref = book.chapters;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    chapter = _ref[_i];
    chapter.type = 'html';
  }
  return callback(null, book);
};

initAssets = function(book, callback) {
  book.assets.initSync();
  return callback(null, book);
};

originalSize = function(epub) {
  return function(program, callback) {
    program.epubsize = fs.statSync(epub).size;
    return callback(null, program);
  };
};

program.command('repair [file]').description('Parses the EPUB, processes XHTML, and prompts for missing details and corrections').option('-P, --no-prompts', "Just use the first guess for landmarks without asking").option('-L, --no-landmarks', "Don't try to add missing landmarks").option('-M, --no-metadata', "Don't try to add missing metadata").option('-g, --generate', "Try to generate missing landmarks").action(function(file, options) {
  var mainProcess;
  program = setup(program, file);
  mainProcess = function(epub, callback) {
    var tasks;
    console.log("Processing " + epub);
    tasks = [utilities.newBookSetup(program), utilities.loadEpubTask(epub), initAndProcessChapters];
    if (options.metadata && options.prompts) {
      tasks = tasks.concat(prompts.metadata);
    }
    if (options.landmarks && options.prompts) {
      tasks = tasks.concat(prompts.landmarks);
    } else if (options.landmarks) {
      tasks.push(prompts.guessLandmarks);
    }
    if (options.generate) {
      tasks = tasks.concat(prompts.generate);
    }
    tasks.push(utilities.saveEpubTask(program, epub));
    tasks.push(utilities.done(program));
    return async.waterfall(tasks, callback);
  };
  return async.mapSeries(program.files, mainProcess, function(err) {
    if (err) {
      return console.log(err);
    } else {
      return console.log('All files processed. Thank you!');
    }
  });
});

program.command('minify [file]').description('Optimises the sizes of images and other assets').option('-S, --no-csso', "No structural optimisations of CSS").option('-Q, --no-pngquant', "Don't quantize pngs to use fewer colours and save size").option('-l, --optimisation <level>', "Optimisation level for PNGs. Default is 2", parseInt, 2).action(function(file, options) {
  var mainProcess;
  program = setup(program, file);
  mainProcess = function(epub, callback) {
    var tasks;
    console.log("Minifying " + epub);
    tasks = [utilities.newBookSetup(program), originalSize(epub), utilities.loadEpubTask(epub), initAssets];
    if (options.csso) {
      tasks.push(optimisations.csso);
    } else {
      tasks.push(optimisations.css);
    }
    tasks = tasks.concat(optimisations.tasks);
    if (options.pngquant) {
      tasks.push(optimisations.pngquant);
    }
    tasks.push(optimisations.optipngTask(options.optimisation));
    tasks.push(utilities.saveEpubTask(program, epub));
    tasks.push(utilities.done(program));
    return async.waterfall(tasks, callback);
  };
  return async.mapSeries(program.files, mainProcess, function(err) {
    if (err) {
      return console.log(err);
    } else {
      return console.log('All files minified. Thank you!');
    }
  });
});

program.command('build').description('Builds an epub out of a folder of HTML files with YAML headers').option('-c, --chapters <directory>', "Directory that contains the chapters. Default is chapters", 'chapters').option('-b, --book <file>', "Text file that contains the chapter filenames in the order they should appear. Default is book.txt", 'book.txt').option('-a, --assets <directory>', "Directory that contains the assets. Default is assets", 'assets/').option('-P, --no-prompts', "Just use the first guess for landmarks without asking").option('-L, --no-landmarks', "Don't try to add missing landmarks").option('-M, --no-metadata', "Don't try to add missing metadata").option('-g, --generate', "Try to generate missing landmarks").action(function(options) {
  var tasks;
  program = setup(program);
  console.log("Building epub");
  tasks = [utilities.buildBook.bind(null, options.chapters, options.book, options.assets), initAssets];
  if (options.metadata && options.prompts) {
    tasks = tasks.concat(prompts.metadata);
  }
  if (options.landmarks && options.prompts) {
    tasks = tasks.concat(prompts.landmarks);
  } else if (options.landmarks) {
    tasks.push(prompts.guessLandmarks);
  }
  if (options.generate) {
    tasks = tasks.concat(prompts.generate);
  }
  tasks.push(utilities.saveMeta);
  tasks.push(utilities.saveEpubTask(program, "book.epub"));
  return async.waterfall(tasks, function(err) {
    if (err) {
      return console.log(err);
    } else {
      return console.log('EPUB built. Thank you!');
    }
  });
});

program.parse(process.argv);
