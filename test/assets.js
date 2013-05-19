'use strict';
var Assets, chai, glob, should, testassets;

chai = require('chai');

should = chai.should();

Assets = require('../src/index').Assets;

glob = require('glob');

testassets = {};

describe('Assets', function() {
  before(function() {
    return testassets = new Assets('test/files/', 'assets/');
  });
  describe('#png', function() {
    return it('should show all pngs', function() {
      testassets.png.should.be.instanceOf(Array);
      return testassets.png[0].should.equal('assets/noise.png');
    });
  });
  describe('#jpg', function() {
    return it('should show all jpg', function() {
      testassets.jpg.should.be.instanceOf(Array);
      return testassets.jpg[0].should.equal('assets/cover.jpg');
    });
  });
  describe('#js', function() {
    return it('should show all js', function() {
      testassets.js.should.be.instanceOf(Array);
      return testassets.js[0].should.equal('assets/jquery.js');
    });
  });
  describe('#css', function() {
    return it('should show all css', function() {
      testassets.css.should.be.instanceOf(Array);
      return testassets.css[0].should.equal('assets/style.css');
    });
  });
  describe('#otf', function() {
    return it('should show all otf', function() {
      testassets.otf.should.be.instanceOf(Array);
      return testassets.otf[0].should.equal('assets/SourceSansPro-Regular.otf');
    });
  });
  return describe('#ttf', function() {
    return it('should show all ttf', function() {
      testassets.ttf.should.be.instanceOf(Array);
      return testassets.ttf[0].should.equal('assets/SourceSansPro-Regular.ttf');
    });
  });
});
