"use strict";

var assert = require('assert')
  , temp   = require('temp')
  , fs     = require('fs')
  , path   = require('path');

temp.dir = __dirname;
temp.track();

var tempDir
  , srcDir
  , tempFileFull = '/tmp.js'
  , tempFileMin  = '/tmp.min.js'
  , tempFileMap  = '/tmp.map.js';

var express = require('express');

var app
  , request;

before(function (done) {
  temp.mkdir('src-', function (err, dirPath) {
    if (err) {
      throw(err);
    }

    srcDir = dirPath;

    temp.mkdir('tmp-', function (err, dirPath) {
      if (err) {
        throw(err);
      }

      tempDir = dirPath;

      app = express();

      app.use(require('../lib/middleware')({
        src: srcDir,
        dest: tempDir,
        generateSourceMap: true
      }));
      app.use(express.static(tempDir));
      app.use(function (req, res) { res.statusCode = 404; res.end('Not found'); });
      app.use(function (err, req, res, next) { console.error(err); res.statusCode = 500; res.end('Internal Server Error') });

      request = require('supertest')(app);

      done();
    });
  });
});

describe('Express', function() {
  var scriptIn = 'function foo() { }';
  var scriptOut = 'function foo(){}';

  it('should not change the original file', function(done) {

    var setup = function() {
      fs.writeFile(path.join(srcDir, tempFileFull), scriptIn, testRequest);
    };

    var testRequest = function(err) {
      if (err) {
        throw(err);
      }

      request.get(tempFileFull)
        .set('accept', 'application/javascript')
        .expect(200)
        .expect('content-type', /application\/javascript/)
        .expect(scriptIn)
        .end(done);
    };

    setup();
  });

  it('should automatically minify javascript file', function(done) {

    var setup = function() {
      fs.writeFile(path.join(srcDir, tempFileFull), scriptIn, testRequest);
    };

    var testRequest = function(err) {
      if (err) {
        throw(err);
      }

      request.get(tempFileMin)
        .set('accept', 'application/javascript')
        .expect(200)
        .expect('content-type', /application\/javascript/)
        .expect(scriptOut + "\n" + '//@ sourceMappingURL=' + tempFileMap)
        .end(done);
    };

    setup();
  });

  it('should automatically create a source map', function(done) {

    var setup = function() {
      fs.writeFile(path.join(srcDir, tempFileFull), scriptIn, testRequest);
    };

    var testRequest = function(err) {
      if (err) {
        throw(err);
      }

      request.get(tempFileMap)
        .set('accept', 'application/javascript')
        .expect(200)
        .expect('content-type', /application\/javascript/)
        .end(done);
    };

    setup();
  });
});