'use strict'

chai = require 'chai'
should = chai.should()
Assets = require('../src/index').Assets
glob = require 'glob'

testassets = {}
describe 'Assets',
  () ->
    before () ->
      testassets = new Assets('test/files/', 'assets/')
    describe '#png',
      () ->
        it 'should show all pngs',
          () ->
            testassets.png.should.be.instanceOf(Array)
            testassets.png[0].should.equal('assets/noise.png')
    describe '#jpg',
      () ->
        it 'should show all jpg',
          () ->
            testassets.jpg.should.be.instanceOf(Array)
            testassets.jpg[0].should.equal('assets/texture.jpg')
    describe '#js',
      () ->
        it 'should show all js',
          () ->
            testassets.js.should.be.instanceOf(Array)
            testassets.js[0].should.equal('assets/jquery.js')
    describe '#css',
      () ->
        it 'should show all css',
          () ->
            testassets.css.should.be.instanceOf(Array)
            testassets.css[0].should.equal('assets/style.css')
    describe '#otf',
      () ->
        it 'should show all otf',
          () ->
            testassets.otf.should.be.instanceOf(Array)
            testassets.otf[0].should.equal('assets/SourceSansPro-Regular.otf')
    describe '#ttf',
      () ->
        it 'should show all ttf',
          () ->
            testassets.ttf.should.be.instanceOf(Array)
            testassets.ttf[0].should.equal('assets/SourceSansPro-Regular.ttf')

    describe '#pngPromise',
      () ->
        it 'should show all pngs',
          (done) ->
            testassets.pngPromise().then(
              (png) ->
                png.should.be.instanceOf(Array)
                png[0].should.equal('assets/noise.png')
                done())
    describe '#jpgPromise',
      () ->
        it 'should show all jpgs',
          (done) ->
            testassets.jpgPromise().then(
              (files) ->
                files.should.be.instanceOf(Array)
                files[0].should.equal('assets/texture.jpg')
                done())
    describe '#jsPromise',
      () ->
        it 'should show all js',
          (done) ->
            testassets.jsPromise().then(
              (files) ->
                files.should.be.instanceOf(Array)
                files[0].should.equal('assets/jquery.js')
                done())
    describe '#cssPromise',
      () ->
        it 'should show all css',
          (done) ->
            testassets.cssPromise().then(
              (files) ->
                files.should.be.instanceOf(Array)
                files[0].should.equal('assets/style.css')
                done())
    describe '#otfPromise',
      () ->
        it 'should show all otf',
          (done) ->
            testassets.otfPromise().then(
              (files) ->
                files.should.be.instanceOf(Array)
                files[0].should.equal('assets/SourceSansPro-Regular.otf')
                done())
    describe '#ttfPromise',
      () ->
        it 'should show all ttf',
          (done) ->
            testassets.ttfPromise().then(
              (files) ->
                files.should.be.instanceOf(Array)
                files[0].should.equal('assets/SourceSansPro-Regular.ttf')
                done())