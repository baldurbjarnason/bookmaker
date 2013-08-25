/*
 * grunt-bookmaker
 * https://github.com/baldurbjarnason//grunt-bookmaker
 *
 * Copyright (c) 2013 Baldur Bjarnason
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        '<%= nodeunit.tests %>',
        'helpers/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },
    coffeelint: {
      options: {
        max_line_length: {
          level: 'ignore'
        }
      },
      app: ['src/*.coffee', 'scripts/*.coffee', 'bookmaker/**/*.coffee']
    },
    coffee: {
      options: {
        bare: true
      },
      tasks: {
        expand: true,
        cwd: 'scripts/',
        src: ['*.coffee'],
        dest: 'src/',
        ext: '.js'    
      },
      lib: {
        expand: true,
        cwd: 'scripts/lib/',
        src: ['*.coffee'],
        dest: 'src/lib/',
        ext: '.js'    
      },
      test: {
        expand: true,
        cwd: 'scripts/test/',
        src: ['*.coffee'],
        dest: 'test/',
        ext: '.js'    
      },
      bookmaker: {
        expand: true,
        cwd: 'app/bookmaker/',
        src: ['*.coffee'],
        dest: 'src/bookmaker/',
        ext: '.js'    
      }
    },
    watch: {
      coffee: {
        files: ['scripts/**/*.coffee'],
        tasks: ['coffeelint', 'coffee']
      },
      js: {
        files: ['helpers/**/*.js','Gruntfile.js'],
        tasks: ['jshint']
      }
    },
    handlebars: {
      options: {
        node: true,
        processName: function (filename) { return path.basename(filename, '.hbs'); }
      },
      main: {
        files: {
          "lib/templates.js": "templates/*.hbs"
        }
      }
    }
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'bookmaker', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['coffeelint', 'coffee']);

};
