'use strict';

// Dependencies
var crypto = require('crypto')
var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');

// Consts
var PLUGIN_NAME = 'gulp-css-buster';

/**
 * Add md5 hash for cache baster to local URL in css.
 * @param  {object} options
 */
module.exports = function(options) {
    var defaults = {
        // assets location used in css file
        assetsPath: '',
    };

    options = extend(defaults, options);

    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
        }

        if (file.isStream()) {
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            transform(file, options.assetsPath, function() {
                cb(null, file);
            });
        }
    });
}

/**
 * Rewrite the file content with cache busted URLs
 * @param  {File}     file
 * @param  {string}   assetsPath assets location used in css file
 * @param  {Function} cb         function (err, file)
 */
function transform(file, assetsPath, cb) {
    var regex = new RegExp("url[(]['\"]?([^'\")]*)['\"]?[)]", "g");

    var contents = file.contents.toString('utf8');

    asyncReplace(contents, regex, function(match, callback) {
        var file = (match[1].charAt(0) == '/') ? match[1] : '/' + match[1];

        md5File(assetsPath + file, function(err, hash) {
            // if md5 fails (ex: file not found), don't replace the url
            if (err) {
                return callback(match[0]);
            }
            callback("url('" + makeUrlWithHash(match[1], hash) + "')");
        });
    }, function(err, newContent) {
        file.contents = new Buffer(newContent);
        cb(null, file);
    });
}

/**
 * Search and replace a pattern with replacer
 * @param  {string}   string
 * @param  {RegExp}   regex
 * @param  {Function} replacer function(match, function(replacement))
 * @param  {Function} done     function(err, newString)
 */
function asyncReplace(string, regex, replacer, done) {
    regex.lastIndex = 0;
    var match = regex.exec(string);
    if (match == null) {
        done(null, string);
    } else {
        replacer(match, function(replacement) {
            var matchIndex = match.index;
            var matchLength = match[0].length;
            var head = string.substring(0, matchIndex) + replacement;
            var tail = string.substring(matchIndex + matchLength);

            if (regex.global) {
                asyncReplace(tail, regex, replacer, function(err, replaced) {
                    done(null, head + replaced);
                });
            } else {
                done(null, head + tail);
            }
        });
    }
}

/**
 * Return a new URL with hash
 * @param  {string} url
 * @param  {string} hash
 * @return {string}
 */
function makeUrlWithHash(url, hash) {
    var filename = url;
    var extension = '';

    var slashPos = url.lastIndexOf('/');
    if (slashPos == -1) {
        var dotPos = url.lastIndexOf('.');
        if (dotPos != -1) {
            filename = url.substr(0, dotPos);
            extension = url.substr(dotPos);
        }
    } else {
        var path = url.substr(0, slashPos);
        var file = url.substr(slashPos);
        var dotPos = file.lastIndexOf('.');
        if (dotPos != -1) {
            filename = path + file.substr(0, dotPos);
            extension = file.substr(dotPos);
        }
    }

    return filename + '-' + hash + extension;
}

/**
 * Get the MD5 hash of a given file
 * @param  {string}   file
 * @param  {Function} cb       function(err, hash)
 */
function md5File(filename, cb) {
    var output = crypto.createHash('md5')
    var input = fs.createReadStream(filename)

    input.on('error', function(err) {
        cb(err)
    })

    output.once('readable', function() {
        cb(null, output.read().toString('hex'))
    })

    input.pipe(output)
}

/**
 * Merge object
 * @param  {object} origin
 * @param  {object} add
 * @return {object}
 */
function extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || typeof add !== 'object') {
        return origin;
    }

    for (var key in add) {
        origin[key] = add[key];
    }

    return origin;
}
