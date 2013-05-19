'use strict'

chai = require 'chai'
should = chai.should()
Assets = require('../src/index').Assets
glob = require 'glob'

testassets = {}
describe 'Assets',
  () ->
    before (done) ->
      testassets = new Assets('test/files/', 'assets/')
      testassets.init().then(() -> done())
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
            testassets.jpg[0].should.equal('assets/cover.jpg')
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
    describe '#copy',
      () ->
        it 'should copy the assets folder to a new location',
          () ->
            testassets.copy('test/files/assets2/')
            assets1 = glob.sync('assets/*', {cwd: 'test/files/assets/'}).join()
            assets2 = glob.sync('assets2/*', {cwd: 'test/files/assets2/'}).join()
            assets1.should.equal(assets2)