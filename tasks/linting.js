'use strict';

/**
 * LINTING
 *
 * gulp lint -> npm run lint (prepush githook via husky)
 * gulp partialLint -> npm run partialLint (precommit githook via husky)
 */

var gulp = require('gulp');
var git = require('vinyl-git');
var filter = require('gulp-filter');
var args = require('yargs').boolean('p').alias('p', 'partial').argv;

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');

var paths = {
  js: ['*.js', 'tasks/*.js', 'js/**/*.js'],
  css: ['css/**/*.css']
};

gulp.task('lint', function() {
  var getFiles = function(src) {
    return !args.partial ? gulp.src(src) : git.staged().pipe(filter(src));
  };

  getFiles(paths.js)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

  getFiles(paths.css)
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('csscomb', function() {
  return gulp.src(paths.css)
    .pipe(csscomb('./CSScomb.json'))
    .pipe(gulp.dest('./css/'));
});
