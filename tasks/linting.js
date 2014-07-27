'use strict';

/**
 * LINTING
 *
 * gulp lint -> npm run lint (prepush githook via husky)
 * gulp partialLint -> npm run partialLint (precommit githook via husky)
 */

var gulp = require('gulp');
var shell = require('shelljs');
var pff = require('pff');
var git = require('gift');
var repo = git('./');

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');

var files = {
  js: ['*.js', 'tasks/*.js', 'js/**/*.js'],
  css: ['css/**/*.css']
};

gulp.task('lint', function() {
  gulp.src(files.js)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

  gulp.src(files.css)
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('partialLint', function(done) {
  var npmBin = './node_modules/.bin';

  repo.status(function(err, status) {
    if (err) throw err;

    var stagedFiles = (function(statusFiles_) {
      var stagedFiles = Object.keys(statusFiles_).filter(function(filename) {
        return statusFiles_[filename].staged;
      }).map(function(filename) {
        return (statusFiles_[filename].type !== 'RM')
          ? filename
          : filename.split(' -> ')[1];
      });

      var isJS = function(file) { return file.slice(-3) === '.js' ; };
      var isCSS = function(file) { return file.slice(-4) === '.css' ; };

      return {
        js: stagedFiles.filter(isJS).join(' '),
        css: stagedFiles.filter(isCSS).join(' ')
      };
    })(status.files);

    [
      { name: 'jscs',    files: 'js' },
      { name: 'jshint',  files: 'js' },
      { name: 'csslint', files: 'css' },
      { name: 'csscomb', files: 'css', flags: '--lint --verbose --config ./CSScomb.json' }
    ].forEach(function(linter) {
      var files = stagedFiles[linter.files];
      var flags = linter.flags || '';

      if (files.length > 0) {
        if (shell.exec(pff('%s/%s %s %s', npmBin, linter.name, flags,  files)).code !== 0) {
          shell.exit(1);
          done();
        }
      }
    });
  });
});

gulp.task('csscomb', function() {
  return gulp.src(files.css)
    .pipe(csscomb('./CSScomb.json'))
    .pipe(gulp.dest('./css/'));
});
