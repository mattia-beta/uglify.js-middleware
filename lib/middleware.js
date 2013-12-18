"use strict";

var uglifyjs = require('uglify-js')
    , colors = require('colors')
    , url = require('url')
    , fs = require('fs')
    , path = require('path')
    , mkdirp = require('mkdirp');

module.exports = uglifyjs.middleware = function (options)
{
    options = options || {};
    if (typeof options === 'string')
    {
        options = {
            src: options
        };
    }

    var minified = [];
    var regex = {
        all: /(\.min)?\.js$/,
        compress: /\.min\.js$/,
        map: /\.map\.js$/
    };

    var log = function (key, val, type)
    {
        if (options.debug || type === 'error')
        {
            switch (type)
            {
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

    if (!options.src)
    {
        throw new Error('uglifyjs-middleware() requires "src" directory');
    }

    if (!options.dest)
    {
        options.dest = options.src;
    }

    options.compress = typeof options.compress === 'undefined' ? 'auto' : options.compress;

    options.prefix = options.prefix || false;
    options.debug = options.debug || false;
    options.force = options.force || false;
    options.once = options.once || false;
    options.generateSourceMap = options.generateSourceMap || false;
    options.uglifyjs = options.uglifyjs || {};

    return function uglifyjsMiddleware(req, res, next)
    {
        // Only handle GET and HEAD requests
        if (req.method.toUpperCase() !== "GET" && req.method.toUpperCase() !== "HEAD")
        {
            return next();
        }

        var filename = url.parse(req.url).pathname;

        if (regex.all.test(filename) && !regex.map.test(filename))
        {
            if (options.prefix && filename.indexOf(options.prefix) === 0)
            {
                filename = filename.substring(options.prefix.length);
            }

            var compress = options.compress === true || (options.compress === 'auto' && regex.compress.test(filename));

            var pathToMin = path.join(options.dest, filename)
                , pathToFull = path.join(options.src, filename.replace(regex.all, '') + '.js')
                , pathToMap = path.join(options.dest, filename.replace(regex.all, '') + '.map.js');

            log('source', pathToFull);
            log('dest', pathToMin);


            var compile = function ()
            {
                var sourceMapAppendFix = '';

                if (options.generateSourceMap)
                {
                    options.uglifyjs.outSourceMap = filename + '.map.js';
                    options.uglifyjs.prefix = 2;

                    sourceMapAppendFix = compress ? "\n" + '//@ sourceMappingURL=' + filename.replace(regex.all, '') + '.map.js' : '';

                    log('map', pathToMap);
                }

                try
                {
                    // check if exists
                    if(!fs.existsSync(pathToFull))
                    {
                        return next();
                    }

                    var uglified = compress ? uglifyjs.minify(pathToFull, options.uglifyjs) : { code: fs.readFileSync(pathToFull, 'utf8') };

                    mkdirp(path.dirname(pathToMin), 511 /* 0777 */, function onDirectoryCreated(err)
                    {
                        if (err)
                        {
                            return next(err);
                        }

                        fs.writeFile(pathToMin, uglified.code + sourceMapAppendFix, function onMinWrite(err)
                        {
                            if (err)
                            {
                                return next(err);
                            }

                            minified[pathToMin] = true;

                            if (compress && options.generateSourceMap)
                            {
                                fs.writeFile(pathToMap, uglified.map, function onMapWrite(err)
                                {
                                    next(err);
                                });
                            }
                            else
                            {
                                next();
                            }
                        });
                    });
                }
                catch (err)
                {
                    next(err);
                }
            };

            if (!minified[pathToMin] || options.force)
            {
                return compile();
            }

            if (options.once)
            {
                return next();
            }

            fs.exists(pathToFull, function onFullExists(exists)
            {
                if (!exists)
                {
                    return next();
                }

                fs.stat(pathToFull, function onFullStat(err, statsFull)
                {
                    if (err)
                    {
                        return next(err);
                    }

                    fs.exists(pathToMin, function onMinExists(exists)
                    {
                        if (!exists)
                        {
                            return compile();
                        }

                        fs.stat(pathToMin, function onMinStat(err, statsMin)
                        {
                            if (err)
                            {
                                return next(err);
                            }

                            if (statsFull.mtime > statsMin.mtime)
                            {
                                return compile();
                            }
                            else
                            {
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