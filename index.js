'use strict';

// Dependencies
const fs = require('fs');
const gutil = require('gulp-util');
const through = require('through2');

// Consts
var PLUGIN_NAME = 'gulp-css-url-bust';

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
    const regex = /url\((['\"]?)(.*?)\1\)/g;

    var contents = file.contents.toString('utf8');

    asyncReplace(contents, regex, function(match, callback) {
        if (match[2].match(/^(?:https?:\/\/|data:)/)) {
            return callback(match[0]);
        }
        var file = (match[2].charAt(0) == '/') ? match[2] : '/' + match[2];

        file = file.split(/[#\?]/)[0];

        md5File(assetsPath + file, function(err, hash) {
            // if md5 fails (ex: file not found), don't replace the url
            if (err) {
                console.log(`Missing url in less: ${match[2]}`);
                return callback(match[0]);
            }
            callback(`url(${match[1]}${makeUrlWithHash(match[2], hash)}${match[1]})`);
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
    let poundSign = url.split('#');
    url = poundSign[0];
    if (url.indexOf('.') != -1) {
        if (url.indexOf('?') != -1) {
            url += '&';
        } else {
            url += '?';
        }
        url += 'mtime=' + hash;
        if (poundSign[1]) {
            url += '#' + poundSign[1];
        }
    }
    return url;
}

/**
 * Get the MD5 hash of a given file
 * @param  {string}   file
 * @param  {Function} cb       function(err, hash)
 */
function md5File(filename, cb) {
    fs.stat(filename, function(err, stat) {
        if (err) {
            cb(err);
        } else {
            cb(null, dateformat(stat.mtime));
        }
    });
}

function dateformat(date) {
    return date.getTime().toString(36);
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
