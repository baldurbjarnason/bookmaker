'use strict';
var program;

program = require('commander');

program.version('0.1.0').option('-f, --folder [path]', 'Output folder for generated EPUB files').option('-o, --output [filename]', 'Filename for generated EPUB file').option('-v, --verbose', "Let's be chatty and loud, shall we?").option('-m, --mangle', 'Obfuscate the font files in the output file');

module.exports = program;
