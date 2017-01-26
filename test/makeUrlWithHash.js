'use strict';

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

describe('makeUrlWithHash', function() {

    it('file-hash.txt', function(done) {
        makeUrlWithHash('file.txt', 'hash').should.equal('file-hash.txt');
        done();
    });
    it('/file-hash.txt', function(done) {
        makeUrlWithHash('/file.txt', 'hash').should.equal('/file-hash.txt');
        done();
    });
    it('file-hash', function(done) {
        makeUrlWithHash('file', 'hash').should.equal('file-hash');
        done();
    });
    it('/file-hash', function(done) {
        makeUrlWithHash('/file', 'hash').should.equal('/file-hash');
        done();
    });
    it('/path/file-hash.txt', function(done) {
        makeUrlWithHash('/path/file.txt', 'hash').should.equal('/path/file-hash.txt');
        done();
    });
    it('/path.pkg/file-hash', function(done) {
        makeUrlWithHash('/path.pkg/file', 'hash').should.equal('/path.pkg/file-hash');
        done();
    });
});
