"use strict";

var uglifyjs = require('uglify-js')
  , colors   = require('colors')
  , url      = require('url');

module.exports = uglifyjs.middleware = function (options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      src: options
    };
  }

  var log = function (key, val, type) {
    if (options.debug || type === 'error') {
      switch (type) {
        case 'log':
        case 'info':
        case 'error':
        case 'warn':
          break;

        default:
          type = 'log';
      }
    }

    console[type]('%s'.cyan + ': ' + '%s'.green, key, val);
  };

  return function (req, res, next) {
    // Only handle GET and HEAD requests
    if (req.method.toUpperCase() !== "GET" && req.method.toUpperCase() !== "HEAD") {
      return next();
    }

    var filename = url.parse(req.url).pathname;

    return next();
  };
};