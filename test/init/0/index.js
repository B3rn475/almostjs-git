var Git = require('simple-git/promise'),
    assert = require('assert'),
    path = require('path'),
    fse = require('fs-extra'),
    tmp = require('tmp-promise'),
    lib = require('../../../lib'),
    testUtils = require('../../utils');

describe('test/init/0 almost-git init without conflicts', function () {
    var repoPath,
        status,
        m0Path = path.join(__dirname, 'm0'),
        git;

    beforeEach(function (done) {
        tmp.dir().then(function (folder) {
            repoPath = folder.path;
            status = new lib.Status(repoPath);
            git = Git(repoPath);
            return fse.copy(m0Path, repoPath);
        }).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    afterEach(function (done) {
        fse.remove(repoPath).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it('should not be a repository', function (done) {
        status.status().then(function (err) {
            done(err);
        }).catch(function (err) {
            done();
        });
    });

    describe('run lib.init without conflicts', function () {

        beforeEach(function (done) {
            lib.init(repoPath).then(function () {
                done();
            }).catch(function (error) {
                done(error);
            });
        });
        it('should leave a clean repository', function (done) {
            git.status().then(function (status) {
                assert.deepEqual(status, {
                    not_added: [],
                    conflicted: [],
                    created: [],
                    deleted: [],
                    modified: [],
                    renamed: [],
                    staged: [],
                    files: [],
                    ahead: 0,
                    behind: 0,
                    current: 'master',
                    tracking: null
                });
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should add the Model commit', function (done) {
            testUtils.assertDifferent(repoPath, m0Path, '.git').then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('status should be a READY', function (done) {
            status.status().then(function (status) {
                assert.deepEqual(status, 'READY');
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('model commit hash should be correct', function (done) {
            var saved_hash;
            status.hash().then(function (hash) {
                saved_hash = hash;
                return git.log();
            }).then(function (log) {
                assert.deepEqual(log.latest.hash.substring(0, 7), saved_hash);
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });
});
