"use strict";

var uglifyjs = require('uglify-js')
  , colors   = require('colors')
  , url      = require('url')
  , fs       = require('fs')
  , path     = require('path');

module.exports = uglifyjs.middleware = function (options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      src: options
    };
  }

  var regex    = /\.min\.js$/
    , minified = [];

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
      console[type]('%s'.cyan + ': ' + '%s'.green, key, val);
    }
  };

  if (!options.src) {
    throw new Error('uglifyjs-middleware() requires "src" directory');
  }

  if (!options.dest) {
    options.dest = options.src;
  }

  options.debug             = options.debug             || false;
  options.force             = options.force             || false;
  options.once              = options.once              || false;
  options.generateSourceMap = options.generateSourceMap || false;
  options.uglifyjs          = options.uglifyjs          || {};

  return function uglifyjsMiddleware (req, res, next) {
    // Only handle GET and HEAD requests
    if (req.method.toUpperCase() !== "GET" && req.method.toUpperCase() !== "HEAD") {
      return next();
    }

    var filename = url.parse(req.url).pathname;

    if (regex.test(filename)) {
      filename = filename.replace(regex, '');

      var pathToMin  = path.join(options.dest, filename + '.min.js')
        , pathToFull = path.join(options.src, filename + '.js')
        , pathToMap  = path.join(options.dest, filename + '.map.js');

      log('source', pathToFull);
      log('dest', pathToMin);

      var compile = function () {
        var sourceMapAppendFix = '';

        if (options.generateSourceMap) {
          options.uglifyjs.outSourceMap = filename + '.map.js';
          options.uglifyjs.prefix       = 2;

          sourceMapAppendFix =  "\n" + '//@ sourceMappingURL=' + filename + '.map.js';

          log('map', pathToMap);
        }

        try {
          var uglified = uglifyjs.minify(pathToFull, options.uglifyjs);

          fs.writeFile(pathToMin, uglified.code + sourceMapAppendFix, function onMinWrite (err) {
            if (err) {
              return next(err);
            }

            minified[pathToFull] = true;

            if (options.generateSourceMap) {
              fs.writeFile(pathToMap, uglified.map, function onMapWrite (err) {
                next(err);
              });
            } else {
              next();
            }
          });
        } catch (err) {
          next(err);
        }
      };

      if (!minified[pathToMin] || options.force) {
        return compile();
      }

      if (options.once) {
        return next();
      }

      fs.exists(pathToFull, function onFullExists (exists) {
        if (!exists) {
          return next();
        }

        fs.stat(pathToFull, function onFullStat (err, statsFull) {
          if (err) {
            return next(err);
          }

          fs.exists(pathToMin, function onMinExists (exists) {
            if (!exists) {
              return compile();
            }

            fs.stat(pathToMin, function onMinStat (err, statsMin) {
              if (err) {
                return next(err);
              }

              if (statsFull.mtime > statsMin.mtime) {
                return compile();
              } else {
                return next();
              }
            });
          });
        });
      });
    }

    return next();
  };
};