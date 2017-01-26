'use strict';

var fs = require("fs"),
    should = require("should"),
    gutil = require('gulp-util'),
    cssBuster = require('../index');

describe('gulp-css-buster', function() {

    it('should work in buffer mode', function(done) {
        var srcFile = new gutil.File({
            contents: fs.readFileSync("test/fixtures/src.css")
        });

        var expectedFile = new gutil.File({
            contents: fs.readFileSync("test/fixtures/expected.css")
        });

        var myCssBuster = cssBuster({
            assetsPath: './test/fixtures'
        });

        myCssBuster.write(srcFile);

        myCssBuster.once('data', function(file) {
            file.isBuffer().should.be.true;

            file.contents.toString('utf8').should.equal(expectedFile.contents.toString('utf8'));
            done();
        });
    });

});
